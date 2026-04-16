package com.cdot.library_management.controller;

import com.cdot.library_management.dto.ReservationResponseDTO;
import com.cdot.library_management.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    //reserve a book
    @PostMapping("/employee/reservations/{bookId}")
    public ResponseEntity<?> reserveBook(@PathVariable Integer bookId) {
        try {
            ReservationResponseDTO response = reservationService.reserveBook(bookId);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //cancel a reserve book
    @DeleteMapping("/employee/reservations/{reservationId}")
    public ResponseEntity<?> cancelReservation(@PathVariable Integer reservationId) {
        try {
            reservationService.cancelReservation(reservationId);
            return ResponseEntity.ok("Reservation cancelled successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //get all your reservations
    @GetMapping("/employee/reservations/my")
    public ResponseEntity<List<ReservationResponseDTO>> getMyReservations() {
        return ResponseEntity.ok(reservationService.getMyReservations());
    }

    //librarian get all pending reservations
    @GetMapping("/librarian/reservations/pending")
    public ResponseEntity<List<ReservationResponseDTO>> getAllPendingReservations() {
        return ResponseEntity.ok(reservationService.getAllPendingReservations());
    }

    //librarian get all reservations
    @GetMapping("/librarian/reservations")
    public ResponseEntity<List<ReservationResponseDTO>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    //fulfill a reservation
    @PatchMapping("/librarian/reservations/{reservationId}/fulfill")
    public ResponseEntity<?> fulfillReservation(@PathVariable Integer reservationId) {
        try {
            ReservationResponseDTO response = reservationService.fulfillReservation(reservationId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}