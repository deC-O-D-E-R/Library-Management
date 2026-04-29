package com.cdot.library_management.controller;

import com.cdot.library_management.dto.SystemLoginRequest;
import com.cdot.library_management.dto.SystemLoginResponse;
import com.cdot.library_management.service.SystemAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system/auth")
public class SystemAuthController {

    private final SystemAuthService systemAuthService;

    public SystemAuthController(SystemAuthService systemAuthService) {
        this.systemAuthService = systemAuthService;
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
}