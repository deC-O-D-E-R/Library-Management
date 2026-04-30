package com.cdot.library_management.service;

import com.cdot.library_management.dto.LoginRequest;
import com.cdot.library_management.dto.LoginResponse;
import com.cdot.library_management.dto.SystemLoginResponse;
import com.cdot.library_management.service.EmailService;
import com.cdot.library_management.entity.User;
import com.cdot.library_management.entity.UserRole;
import com.cdot.library_management.entity.SystemAccount;
import com.cdot.library_management.repository.UserRepository;
import com.cdot.library_management.repository.UserRoleRepository;
import com.cdot.library_management.repository.SystemAccountRepository;
import com.cdot.library_management.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final SystemAccountRepository systemAccountRepository;
    private final PermissionService permissionService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       UserRoleRepository userRoleRepository,
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder,
                       SystemAccountRepository systemAccountRepository,
                       PermissionService permissionService,
                       @Autowired(required = false) EmailService emailService) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.systemAccountRepository = systemAccountRepository;
        this.permissionService = permissionService;
        this.emailService = emailService;
    }

    //rate limiting
    private static class LoginAttempt {
        int count = 0;
        LocalDateTime lockedUntil = null;
    }

    private final Map<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();

    private void checkRateLimit(String staffNumber) {
        LoginAttempt attempt = loginAttempts.getOrDefault(staffNumber, new LoginAttempt());
        if (attempt.lockedUntil != null && LocalDateTime.now().isBefore(attempt.lockedUntil)) {
            long minutesLeft = java.time.Duration.between(LocalDateTime.now(), attempt.lockedUntil).toMinutes() + 1;
            throw new RuntimeException("Account temporarily locked. Try again in " + minutesLeft + " minute(s).");
        }
    }

    private void recordFailedAttempt(String staffNumber) {
        LoginAttempt attempt = loginAttempts.computeIfAbsent(staffNumber, k -> new LoginAttempt());
        attempt.count++;
        if (attempt.count >= 3) {
            attempt.lockedUntil = LocalDateTime.now().plusMinutes(30);
            attempt.count = 0;
        }
        loginAttempts.put(staffNumber, attempt);
    }

    private void clearAttempts(String staffNumber) {
        loginAttempts.remove(staffNumber);
    }

    //user login
    public LoginResponse login(LoginRequest request) {
        checkRateLimit(request.getStaffNumber());

        User user = userRepository.findByStaffNumber(request.getStaffNumber())
                .orElseThrow(() -> new RuntimeException("Invalid staff number or password"));

        if (!user.getIsActive()) {
            throw new RuntimeException("Your account has been deactivated. Please contact admin");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            recordFailedAttempt(request.getStaffNumber());
            throw new RuntimeException("Invalid staff number or password");
        }

        clearAttempts(request.getStaffNumber());

        List<UserRole> userRoles = userRoleRepository.findByUser_UserId(user.getUserId());
        List<String> roles = userRoles.stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());

        if (roles.contains("ADMIN") || roles.contains("LIBRARIAN")) {
            throw new RuntimeException("Please use the Admin/Librarian login.");
        }

        String token = jwtUtil.generateToken(user.getStaffNumber(), roles);

        return new LoginResponse(token, user.getStaffNumber(), user.getName(), user.getEmail(), roles);
    }

    public Object unifiedLogin(String username, String password) {
        //try system account first
        Optional<SystemAccount> systemAccount = systemAccountRepository.findByUsername(username);
        if (systemAccount.isPresent()) {
            SystemAccount account = systemAccount.get();

            if (!account.getIsActive()) {
                throw new RuntimeException("This account has been deactivated. Please contact admin.");
            }

            checkRateLimit(username);

            if (!passwordEncoder.matches(password, account.getPasswordHash())) {
                recordFailedAttempt(username);
                throw new RuntimeException("Invalid username or password");
            }

            clearAttempts(username);
            account.setLastLogin(LocalDateTime.now());
            systemAccountRepository.save(account);

            List<String> permissions = permissionService.getPermissionKeys(account.getAccountId());
            String token = jwtUtil.generateToken(account.getUsername(), List.of(account.getRole()));

            return new SystemLoginResponse(
                    token,
                    account.getUsername(),
                    account.getAccountName(),
                    account.getEmail(),
                    account.getRole(),
                    permissions
            );
        }

        //fall back to employee
        Optional<User> userOpt = userRepository.findByStaffNumber(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (!user.getIsActive()) {
                throw new RuntimeException("Your account has been deactivated. Please contact admin.");
            }

            checkRateLimit(username);

            if (!passwordEncoder.matches(password, user.getPasswordHash())) {
                recordFailedAttempt(username);
                throw new RuntimeException("Invalid username or password");
            }

            clearAttempts(username);

            List<UserRole> userRoles = userRoleRepository.findByUser_UserId(user.getUserId());
            List<String> roles = userRoles.stream()
                    .map(ur -> ur.getRole().getRoleName())
                    .collect(Collectors.toList());

            String token = jwtUtil.generateToken(user.getStaffNumber(), roles);
            return new LoginResponse(token, user.getStaffNumber(), user.getName(), user.getEmail(), roles);
        }

        throw new RuntimeException("Invalid username or password");
    }

    //forgot password
    public void sendOtp(String staffNumber) {
        User user = userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("No account found with this staff number"));

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        if (emailService != null) {
            emailService.sendOtpEmail(user.getEmail(), user.getName(), otp);
        }
    }

    public void verifyOtp(String staffNumber, String otp) {
        User user = userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
    }

    public void resetPassword(String staffNumber, String otp, String newPassword) {
        verifyOtp(staffNumber, otp);

        User user = userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

}