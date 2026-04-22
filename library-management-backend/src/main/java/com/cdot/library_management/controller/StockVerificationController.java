package com.cdot.library_management.controller;

import com.cdot.library_management.dto.ScanRequestDTO;
import com.cdot.library_management.dto.StockVerificationRequestDTO;
import com.cdot.library_management.dto.StockVerificationResponseDTO;
import com.cdot.library_management.entity.User;
import com.cdot.library_management.repository.UserRepository;
import com.cdot.library_management.service.StockVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/librarian/stock")
public class StockVerificationController {

    private final StockVerificationService stockVerificationService;
    private final UserRepository userRepository;

    public StockVerificationController(StockVerificationService stockVerificationService,
                                        UserRepository userRepository) {
        this.stockVerificationService = stockVerificationService;
        this.userRepository = userRepository;
    }

    //get users to assign them as verifier
    @GetMapping("/users")
    public ResponseEntity<?> getVerificationUsers() {
        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("userId", u.getUserId());
                    map.put("name", u.getName());
                    map.put("staffNumber", u.getStaffNumber());
                    map.put("designation", u.getDesignation());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    //initiate a verification
    @PostMapping("/initiate")
    public ResponseEntity<?> initiateVerification(@RequestBody StockVerificationRequestDTO request) {
        try {
            StockVerificationResponseDTO response =
                    stockVerificationService.initiateVerification(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //scan the physically checked pdf entries one by one
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

    //mark complete the verification
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

    //get all the verifications
    @GetMapping
    public ResponseEntity<List<StockVerificationResponseDTO>> getAllVerifications() {
        return ResponseEntity.ok(stockVerificationService.getAllVerifications());
    }

    //get verification by ID
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

    //get the verifiers assiged
    @GetMapping("/{verificationId}/assignments")
    public ResponseEntity<?> getAssignments(@PathVariable Integer verificationId) {
        try {
            return ResponseEntity.ok(
                    stockVerificationService.getAssignments(verificationId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //get the sheet to be printed
    @GetMapping("/{verificationId}/print/{assignmentId}")
    public ResponseEntity<?> getPrintSheet(@PathVariable Integer verificationId,
                                            @PathVariable Integer assignmentId) {
        try {
            return ResponseEntity.ok(
                    stockVerificationService.getPrintSheetData(verificationId, assignmentId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //get discrepency report
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