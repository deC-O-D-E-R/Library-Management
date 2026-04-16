package com.cdot.library_management.controller;

import com.cdot.library_management.dto.FineResponseDTO;
import com.cdot.library_management.service.FineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/librarian/fines")
public class FineController {

    private final FineService fineService;

    public FineController(FineService fineService) {
        this.fineService = fineService;
    }

    @GetMapping
    public ResponseEntity<List<FineResponseDTO>> getAllFines() {
        return ResponseEntity.ok(fineService.getAllFines());
    }

    @GetMapping("/{fineId}")
    public ResponseEntity<?> getFineById(@PathVariable Integer fineId) {
        try {
            FineResponseDTO response = fineService.getFineById(fineId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FineResponseDTO>> getFinesByUser(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(fineService.getFinesByUser(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FineResponseDTO>> getPendingFines() {
        return ResponseEntity.ok(fineService.getPendingFines());
    }

    @PatchMapping("/{fineId}/pay")
    public ResponseEntity<?> markAsPaid(@PathVariable Integer fineId) {
        try {
            FineResponseDTO response = fineService.markAsPaid(fineId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{fineId}/waive")
    public ResponseEntity<?> markAsWaived(@PathVariable Integer fineId) {
        try {
            FineResponseDTO response = fineService.markAsWaived(fineId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}