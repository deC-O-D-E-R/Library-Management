package com.cdot.library_management.controller;

import com.cdot.library_management.dto.BookResponseDTO;
import com.cdot.library_management.dto.CirculationResponseDTO;
import com.cdot.library_management.dto.StockVerificationResponseDTO;
import com.cdot.library_management.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/circulation")
    public ResponseEntity<List<CirculationResponseDTO>> getCirculationReport(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(reportService.getCirculationReport(status));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBorrowingReport(@PathVariable Integer userId) {
        try {
            Map<String, Object> report = reportService.getUserBorrowingReport(userId);
            return ResponseEntity.ok(report);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/inventory")
    public ResponseEntity<List<BookResponseDTO>> getInventoryReport() {
        return ResponseEntity.ok(reportService.getInventoryReport());
    }

    @GetMapping("/holding-summary")
    public ResponseEntity<List<Map<String, Object>>> getHoldingSummary() {
        return ResponseEntity.ok(reportService.getHoldingSummary());
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Map<String, Object>>> getOverdueReport() {
        return ResponseEntity.ok(reportService.getOverdueReport());
    }

    @GetMapping("/stock-verification/{verificationId}")
    public ResponseEntity<?> getStockVerificationReport(
            @PathVariable Integer verificationId) {
        try {
            StockVerificationResponseDTO report =
                    reportService.getStockVerificationReport(verificationId);
            return ResponseEntity.ok(report);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}