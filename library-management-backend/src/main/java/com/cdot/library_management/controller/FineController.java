package com.cdot.library_management.controller;

import com.cdot.library_management.dto.FineResponseDTO;
import com.cdot.library_management.service.FineService;
import com.cdot.library_management.service.PermissionService;
import com.cdot.library_management.service.SystemConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/librarian/fines")
public class FineController {

    private final FineService fineService;
    private final SystemConfigService systemConfigService;
    private final PermissionService permissionService;

    public FineController(FineService fineService,
                          SystemConfigService systemConfigService,
                          PermissionService permissionService) {
        this.fineService = fineService;
        this.systemConfigService = systemConfigService;
        this.permissionService = permissionService;
    }

    @GetMapping("/system/fine-enabled")
    public ResponseEntity<Boolean> isFineSystemEnabled() {
        return ResponseEntity.ok(systemConfigService.isFineSystemEnabled());
    }

    @GetMapping
    public ResponseEntity<?> getAllFines() {
        if (!permissionService.hasPermission("MANAGE_FINES")) {
            return ResponseEntity.status(403).body("You do not have permission to manage fines");
        }
        return ResponseEntity.ok(fineService.getAllFines());
    }

    @GetMapping("/{fineId}")
    public ResponseEntity<?> getFineById(@PathVariable Integer fineId) {
        if (!permissionService.hasPermission("MANAGE_FINES")) {
            return ResponseEntity.status(403).body("Access denied");
        }
        try {
            return ResponseEntity.ok(fineService.getFineById(fineId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getFinesByUser(@PathVariable Integer userId) {
        if (!permissionService.hasPermission("MANAGE_FINES")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(fineService.getFinesByUser(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingFines() {
        if (!permissionService.hasPermission("MANAGE_FINES")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(fineService.getPendingFines());
    }

    @PatchMapping("/{fineId}/pay")
    public ResponseEntity<?> markAsPaid(@PathVariable Integer fineId) {
        if (!permissionService.hasPermission("MANAGE_FINES")) {
            return ResponseEntity.status(403).body("You do not have permission to manage fines");
        }
        try {
            return ResponseEntity.ok(fineService.markAsPaid(fineId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{fineId}/waive")
    public ResponseEntity<?> markAsWaived(@PathVariable Integer fineId) {
        if (!permissionService.hasPermission("MANAGE_FINES")) {
            return ResponseEntity.status(403).body("You do not have permission to manage fines");
        }
        try {
            return ResponseEntity.ok(fineService.markAsWaived(fineId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}