package com.cdot.library_management.controller;

import com.cdot.library_management.dto.CirculationRequestDTO;
import com.cdot.library_management.dto.UserResponseDTO;
import com.cdot.library_management.dto.CirculationResponseDTO;
import com.cdot.library_management.dto.BookResponseDTO;
import com.cdot.library_management.service.UserService;
import com.cdot.library_management.service.BookService;
import com.cdot.library_management.service.CirculationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/librarian/circulation")
public class CirculationController {

    private final CirculationService circulationService;
    private final UserService userService;
    private final BookService bookService;

    public CirculationController(CirculationService circulationService,
                                UserService userService,
                                BookService bookService) {
        this.circulationService = circulationService;
        this.userService = userService;
        this.bookService = bookService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    
    @GetMapping("/books")
    public ResponseEntity<List<BookResponseDTO>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/books/{bookId}")
    public ResponseEntity<?> getBookById(@PathVariable Integer bookId) {
        try {
            return ResponseEntity.ok(bookService.getBookById(bookId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/issue")
    public ResponseEntity<?> issueBook(@RequestBody CirculationRequestDTO request) {
        try {
            CirculationResponseDTO response = circulationService.issueBook(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/return/{circulationId}")
    public ResponseEntity<?> returnBook(@PathVariable Integer circulationId) {
        try {
            CirculationResponseDTO response = circulationService.returnBook(circulationId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<CirculationResponseDTO>> getAllCirculations() {
        return ResponseEntity.ok(circulationService.getAllCirculations());
    }

    @GetMapping("/{circulationId}")
    public ResponseEntity<?> getCirculationById(@PathVariable Integer circulationId) {
        try {
            CirculationResponseDTO response = circulationService.getCirculationById(circulationId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CirculationResponseDTO>> getCirculationByUser(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(circulationService.getCirculationByUser(userId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<CirculationResponseDTO>> getOverdueCirculations() {
        return ResponseEntity.ok(circulationService.getOverdueCirculations());
    }

    @GetMapping("/issued")
    public ResponseEntity<List<CirculationResponseDTO>> getIssuedCirculations() {
        return ResponseEntity.ok(circulationService.getIssuedCirculations());
    }
}