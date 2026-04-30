package com.cdot.library_management.controller;

import com.cdot.library_management.dto.ReservationResponseDTO;
import com.cdot.library_management.service.PermissionService;
import com.cdot.library_management.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReservationController {

    private final ReservationService reservationService;
    private final PermissionService permissionService;

    public ReservationController(ReservationService reservationService,
                                  PermissionService permissionService) {
        this.reservationService = reservationService;
        this.permissionService = permissionService;
    }

    @PostMapping("/employee/reservations/{bookId}")
    public ResponseEntity<?> reserveBook(@PathVariable Integer bookId) {
        try {
            return ResponseEntity.status(201).body(reservationService.reserveBook(bookId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/employee/reservations/{reservationId}")
    public ResponseEntity<?> cancelReservation(@PathVariable Integer reservationId) {
        try {
            reservationService.cancelReservation(reservationId);
            return ResponseEntity.ok("Reservation cancelled successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/employee/reservations/my")
    public ResponseEntity<List<ReservationResponseDTO>> getMyReservations() {
        return ResponseEntity.ok(reservationService.getMyReservations());
    }

    @GetMapping("/librarian/reservations/pending")
    public ResponseEntity<?> getAllPendingReservations() {
        if (!permissionService.hasPermission("MANAGE_RESERVATIONS")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(reservationService.getAllPendingReservations());
    }

    @GetMapping("/librarian/reservations")
    public ResponseEntity<?> getAllReservations() {
        if (!permissionService.hasPermission("MANAGE_RESERVATIONS")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @PatchMapping("/librarian/reservations/{reservationId}/fulfill")
    public ResponseEntity<?> fulfillReservation(@PathVariable Integer reservationId) {
        if (!permissionService.hasPermission("MANAGE_RESERVATIONS")) {
            return ResponseEntity.status(403).body("You do not have permission to manage reservations");
        }
        try {
            return ResponseEntity.ok(reservationService.fulfillReservation(reservationId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/librarian/reservations/book/{bookId}")
    public ResponseEntity<?> getReservationsByBook(@PathVariable Integer bookId) {
        if (!permissionService.hasPermission("MANAGE_RESERVATIONS")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(reservationService.getReservationsByBook(bookId));
    }
}