package com.cdot.library_management.controller;

import com.cdot.library_management.dto.SystemLoginRequest;
import com.cdot.library_management.dto.SystemLoginResponse;
import com.cdot.library_management.service.SystemAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.cdot.library_management.entity.SystemAccount;
import com.cdot.library_management.repository.SystemAccountRepository;
import com.cdot.library_management.service.PermissionService;
import org.springframework.security.core.context.SecurityContextHolder;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/system/auth")
public class SystemAuthController {

    private final SystemAuthService systemAuthService;
    private final SystemAccountRepository systemAccountRepository;
    private final PermissionService permissionService;

    public SystemAuthController(SystemAuthService systemAuthService,
                                SystemAccountRepository systemAccountRepository,
                                PermissionService permissionService) {
        this.systemAuthService = systemAuthService;
        this.systemAccountRepository = systemAccountRepository;
        this.permissionService = permissionService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody SystemLoginRequest request) {
        try {
            SystemLoginResponse response = systemAuthService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("temporarily locked")) {
                return ResponseEntity.status(423).body(e.getMessage());
            }
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String username) {
        try {
            systemAuthService.sendOtp(username);
            return ResponseEntity.ok("OTP sent to registered email");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String username,
                                        @RequestParam String otp) {
        try {
            systemAuthService.verifyOtp(username, otp);
            return ResponseEntity.ok("OTP verified");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String username,
                                            @RequestParam String otp,
                                            @RequestParam String newPassword) {
        try {
            systemAuthService.resetPassword(username, otp, newPassword);
            return ResponseEntity.ok("Password reset successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        SystemAccount account = systemAccountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        List<String> permissions = permissionService.getPermissionKeys(account.getAccountId());

        return ResponseEntity.ok(Map.of("permissions", permissions));
    }
}