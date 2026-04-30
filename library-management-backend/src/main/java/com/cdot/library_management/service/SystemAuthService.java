package com.cdot.library_management.service;

import com.cdot.library_management.dto.SystemLoginRequest;
import com.cdot.library_management.dto.SystemLoginResponse;
import com.cdot.library_management.entity.SystemAccount;
import com.cdot.library_management.repository.SystemAccountRepository;
import com.cdot.library_management.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SystemAuthService {

    private final SystemAccountRepository systemAccountRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PermissionService permissionService;

    public SystemAuthService(SystemAccountRepository systemAccountRepository,
                             JwtUtil jwtUtil,
                             PasswordEncoder passwordEncoder,
                             PermissionService permissionService,
                             @org.springframework.beans.factory.annotation.Autowired(required = false) EmailService emailService) {
        this.systemAccountRepository = systemAccountRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.permissionService = permissionService;
        this.emailService = emailService;
    }

    //rate limiting

    private static class LoginAttempt {
        int count = 0;
        LocalDateTime lockedUntil = null;
    }

    private final Map<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();

    private void checkRateLimit(String username) {
        LoginAttempt attempt = loginAttempts.getOrDefault(username, new LoginAttempt());
        if (attempt.lockedUntil != null && LocalDateTime.now().isBefore(attempt.lockedUntil)) {
            long minutesLeft = java.time.Duration.between(LocalDateTime.now(), attempt.lockedUntil).toMinutes() + 1;
            throw new RuntimeException("Account temporarily locked. Try again in " + minutesLeft + " minute(s).");
        }
    }

    private void recordFailedAttempt(String username) {
        LoginAttempt attempt = loginAttempts.computeIfAbsent(username, k -> new LoginAttempt());
        attempt.count++;
        if (attempt.count >= 3) {
            attempt.lockedUntil = LocalDateTime.now().plusMinutes(30);
            attempt.count = 0;
        }
        loginAttempts.put(username, attempt);
    }

    private void clearAttempts(String username) {
        loginAttempts.remove(username);
    }

    //login

    public SystemLoginResponse login(SystemLoginRequest request) {
        checkRateLimit(request.getUsername());

        SystemAccount account = systemAccountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!account.getIsActive()) {
            throw new RuntimeException("This account has been deactivated. Please contact admin.");
        }

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            recordFailedAttempt(request.getUsername());
            throw new RuntimeException("Invalid username or password");
        }

        clearAttempts(request.getUsername());

        account.setLastLogin(LocalDateTime.now());
        systemAccountRepository.save(account);

        String token = jwtUtil.generateToken(account.getUsername(), List.of(account.getRole()));

        List<String> permissions = permissionService.getPermissionKeys(account.getAccountId());

        return new SystemLoginResponse(
                token,
                account.getUsername(),
                account.getAccountName(),
                account.getEmail(),
                account.getRole(),
                permissions
        );
    }

    //forgot password

    public void sendOtp(String username) {
        SystemAccount account = systemAccountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("No account found with this username"));

        if (account.getEmail() == null || account.getEmail().isBlank()) {
            throw new RuntimeException("No email associated with this account. Please contact admin.");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        account.setOtpCode(otp);
        account.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        systemAccountRepository.save(account);

        if (emailService != null) {
            emailService.sendOtpEmail(account.getEmail(), account.getAccountName(), otp);
        }
    }

    public void verifyOtp(String username, String otp) {
        SystemAccount account = systemAccountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getOtpCode() == null || !account.getOtpCode().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (account.getOtpExpiry() == null || LocalDateTime.now().isAfter(account.getOtpExpiry())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
    }

    public void resetPassword(String username, String otp, String newPassword) {
        verifyOtp(username, otp);

        SystemAccount account = systemAccountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setPasswordHash(passwordEncoder.encode(newPassword));
        account.setOtpCode(null);
        account.setOtpExpiry(null);
        systemAccountRepository.save(account);
    }
}