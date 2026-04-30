package com.cdot.library_management.controller;

import com.cdot.library_management.dto.CreateSystemAccountRequest;
import com.cdot.library_management.dto.SystemAccountResponse;
import com.cdot.library_management.service.SystemAccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/admin/system-accounts")
public class SystemAccountController {

    private final SystemAccountService systemAccountService;

    public SystemAccountController(SystemAccountService systemAccountService) {
        this.systemAccountService = systemAccountService;
    }

    @GetMapping
    public ResponseEntity<List<SystemAccountResponse>> getAllAccounts() {
        return ResponseEntity.ok(systemAccountService.getAllAccounts());
    }

    @PostMapping
    public ResponseEntity<?> createAccount(@RequestBody CreateSystemAccountRequest request) {
        try {
            String createdByUsername = SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            SystemAccountResponse response = systemAccountService.createAccount(request, createdByUsername);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{accountId}/deactivate")
    public ResponseEntity<?> deactivateAccount(@PathVariable Integer accountId) {
        try {
            String requestedByUsername = SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            systemAccountService.deactivateAccount(accountId, requestedByUsername);
            return ResponseEntity.ok("Account deactivated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{accountId}/permissions")
    public ResponseEntity<?> updatePermissions(
            @PathVariable Integer accountId,
            @RequestBody List<String> permissionKeys) {
        try {
            SystemAccountResponse response = systemAccountService.updatePermissions(accountId, permissionKeys);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}