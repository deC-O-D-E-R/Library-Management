package com.cdot.library_management.controller;

import com.cdot.library_management.dto.ScanRequestDTO;
import com.cdot.library_management.dto.StockVerificationRequestDTO;
import com.cdot.library_management.dto.StockVerificationResponseDTO;
import com.cdot.library_management.service.StockVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/librarian/stock")
public class StockVerificationController {

    private final StockVerificationService stockVerificationService;

    public StockVerificationController(StockVerificationService stockVerificationService) {
        this.stockVerificationService = stockVerificationService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiateVerification(
            @RequestBody StockVerificationRequestDTO request) {
        try {
            StockVerificationResponseDTO response =
                    stockVerificationService.initiateVerification(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{verificationId}/scan")
    public ResponseEntity<?> scanCopy(@PathVariable Integer verificationId,
                                       @RequestBody ScanRequestDTO request) {
        try {
            StockVerificationResponseDTO response =
                    stockVerificationService.scanCopy(verificationId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{verificationId}/complete")
    public ResponseEntity<?> completeVerification(@PathVariable Integer verificationId) {
        try {
            StockVerificationResponseDTO response =
                    stockVerificationService.completeVerification(verificationId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<StockVerificationResponseDTO>> getAllVerifications() {
        return ResponseEntity.ok(stockVerificationService.getAllVerifications());
    }

    @GetMapping("/{verificationId}")
    public ResponseEntity<?> getVerificationById(@PathVariable Integer verificationId) {
        try {
            StockVerificationResponseDTO response =
                    stockVerificationService.getVerificationById(verificationId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{verificationId}/discrepancy")
    public ResponseEntity<?> getDiscrepancyReport(@PathVariable Integer verificationId) {
        try {
            StockVerificationResponseDTO response =
                    stockVerificationService.getDiscrepancyReport(verificationId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}