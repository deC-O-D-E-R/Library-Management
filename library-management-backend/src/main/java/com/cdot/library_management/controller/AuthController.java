package com.cdot.library_management.controller;

import com.cdot.library_management.dto.LoginRequest;
import com.cdot.library_management.dto.LoginResponse;
import com.cdot.library_management.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("temporarily locked")) {
                return ResponseEntity.status(423).body(e.getMessage());
            }
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/unified-login")
    public ResponseEntity<?> unifiedLogin(@RequestBody LoginRequest request) {
        try {
            Object response = authService.unifiedLogin(
                request.getStaffNumber(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("temporarily locked")) {
                return ResponseEntity.status(423).body(e.getMessage());
            }
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String staffNumber) {
        try {
            authService.sendOtp(staffNumber);
            return ResponseEntity.ok("OTP sent to registered email");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String staffNumber,
                                        @RequestParam String otp) {
        try {
            authService.verifyOtp(staffNumber, otp);
            return ResponseEntity.ok("OTP verified");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String staffNumber,
                                            @RequestParam String otp,
                                            @RequestParam String newPassword) {
        try {
            authService.resetPassword(staffNumber, otp, newPassword);
            return ResponseEntity.ok("Password reset successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}