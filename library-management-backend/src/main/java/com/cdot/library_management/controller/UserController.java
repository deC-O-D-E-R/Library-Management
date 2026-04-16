package com.cdot.library_management.controller;

import com.cdot.library_management.dto.UserRequestDTO;
import com.cdot.library_management.dto.UserResponseDTO;
import com.cdot.library_management.service.UserService;
import com.cdot.library_management.dto.BulkUploadResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> addUser(@RequestBody UserRequestDTO request) {
        try {
            UserResponseDTO response = userService.addUser(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> editUser(@PathVariable Integer userId,
                                      @RequestBody UserRequestDTO request) {
        try {
            UserResponseDTO response = userService.editUser(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Integer userId) {
        try {
            UserResponseDTO response = userService.deactivateUser(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Integer userId) {
        try {
            UserResponseDTO response = userService.getUserById(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search/{staffNumber}")
    public ResponseEntity<?> getUserByStaffNumber(@PathVariable String staffNumber) {
        try {
            UserResponseDTO response = userService.getUserByStaffNumber(staffNumber);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<UserResponseDTO>> getActiveUsers() {
        return ResponseEntity.ok(userService.getActiveUsers());
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUploadUsers(@RequestParam("file") MultipartFile file) {
        try {
            BulkUploadResponse response = userService.bulkUploadUsers(file);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}