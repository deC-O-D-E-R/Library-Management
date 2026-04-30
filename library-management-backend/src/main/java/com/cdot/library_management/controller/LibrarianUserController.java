package com.cdot.library_management.controller;

import com.cdot.library_management.dto.UserRequestDTO;
import com.cdot.library_management.dto.UserResponseDTO;
import com.cdot.library_management.dto.BulkUploadResponse;
import com.cdot.library_management.service.PermissionService;
import com.cdot.library_management.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/librarian/users")
public class LibrarianUserController {

    private final UserService userService;
    private final PermissionService permissionService;

    public LibrarianUserController(UserService userService,
                                    PermissionService permissionService) {
        this.userService = userService;
        this.permissionService = permissionService;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        if (!permissionService.hasPermission("MANAGE_USERS")) {
            return ResponseEntity.status(403).body("Access denied");
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Integer userId) {
        if (!permissionService.hasPermission("MANAGE_USERS")) {
            return ResponseEntity.status(403).body("Access denied");
        }
        try {
            return ResponseEntity.ok(userService.getUserById(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search/{staffNumber}")
    public ResponseEntity<?> getUserByStaffNumber(@PathVariable String staffNumber) {
        if (!permissionService.hasPermission("MANAGE_USERS")) {
            return ResponseEntity.status(403).body("Access denied");
        }
        try {
            return ResponseEntity.ok(userService.getUserByStaffNumber(staffNumber));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveUsers() {
        if (!permissionService.hasPermission("MANAGE_USERS")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userService.getActiveUsers());
    }

    @PostMapping
    public ResponseEntity<?> addUser(@RequestBody UserRequestDTO request) {
        if (!permissionService.hasPermission("MANAGE_USERS")) {
            return ResponseEntity.status(403).body("You do not have permission to manage users");
        }
        try {
            return ResponseEntity.status(201).body(userService.addUser(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> editUser(@PathVariable Integer userId,
                                       @RequestBody UserRequestDTO request) {
        if (!permissionService.hasPermission("MANAGE_USERS")) {
            return ResponseEntity.status(403).body("You do not have permission to manage users");
        }
        try {
            return ResponseEntity.ok(userService.editUser(userId, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Integer userId) {
        if (!permissionService.hasPermission("MANAGE_USERS")) {
            return ResponseEntity.status(403).body("You do not have permission to manage users");
        }
        try {
            return ResponseEntity.ok(userService.deactivateUser(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUploadUsers(@RequestParam("file") MultipartFile file) {
        if (!permissionService.hasPermission("MANAGE_USERS")) {
            return ResponseEntity.status(403).body("You do not have permission to manage users");
        }
        try {
            return ResponseEntity.ok(userService.bulkUploadUsers(file));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}