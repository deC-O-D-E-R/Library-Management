package com.cdot.library_management.controller;

import com.cdot.library_management.dto.CirculationRequestDTO;
import com.cdot.library_management.dto.UserResponseDTO;
import com.cdot.library_management.dto.CirculationResponseDTO;
import com.cdot.library_management.dto.BookResponseDTO;
import com.cdot.library_management.service.UserService;
import com.cdot.library_management.service.BookService;
import com.cdot.library_management.service.CirculationService;
import com.cdot.library_management.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/librarian/circulation")
public class CirculationController {

    private final CirculationService circulationService;
    private final UserService userService;
    private final BookService bookService;
    private final PermissionService permissionService;

    public CirculationController(CirculationService circulationService,
                                UserService userService,
                                BookService bookService,
                                PermissionService permissionService) {
        this.circulationService = circulationService;
        this.userService = userService;
        this.bookService = bookService;
        this.permissionService = permissionService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/books")
    public ResponseEntity<?> getAllBooks() {
        if (!permissionService.hasPermission("SEARCH_BOOKS") &&
            !permissionService.hasPermission("ISSUE_RETURN_BOOKS")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/books/{bookId}")
    public ResponseEntity<?> getBookById(@PathVariable Integer bookId) {
        if (!permissionService.hasPermission("SEARCH_BOOKS") &&
            !permissionService.hasPermission("ISSUE_RETURN_BOOKS")) {
            return ResponseEntity.status(403).body("Access denied");
        }
        try {
            return ResponseEntity.ok(bookService.getBookById(bookId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/issue")
    public ResponseEntity<?> issueBook(@RequestBody CirculationRequestDTO request) {
        if (!permissionService.hasPermission("ISSUE_RETURN_BOOKS")) {
            return ResponseEntity.status(403).body("You do not have permission to issue books");
        }
        try {
            CirculationResponseDTO response = circulationService.issueBook(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/return/{circulationId}")
    public ResponseEntity<?> returnBook(@PathVariable Integer circulationId) {
        if (!permissionService.hasPermission("ISSUE_RETURN_BOOKS")) {
            return ResponseEntity.status(403).body("You do not have permission to return books");
        }
        try {
            CirculationResponseDTO response = circulationService.returnBook(circulationId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<CirculationResponseDTO>> getAllCirculations() {
        if (!permissionService.hasPermission("ISSUE_RETURN_BOOKS")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(circulationService.getAllCirculations());
    }

    @GetMapping("/{circulationId}")
    public ResponseEntity<?> getCirculationById(@PathVariable Integer circulationId) {
        if (!permissionService.hasPermission("ISSUE_RETURN_BOOKS")) {
            return ResponseEntity.status(403).body("Access denied");
        }
        try {
            return ResponseEntity.ok(circulationService.getCirculationById(circulationId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCirculationByUser(@PathVariable Integer userId) {
        if (!permissionService.hasPermission("ISSUE_RETURN_BOOKS")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(circulationService.getCirculationByUser(userId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<?> getOverdueCirculations() {
        if (!permissionService.hasPermission("ISSUE_RETURN_BOOKS")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(circulationService.getOverdueCirculations());
    }

    @GetMapping("/issued")
    public ResponseEntity<?> getIssuedCirculations() {
        if (!permissionService.hasPermission("ISSUE_RETURN_BOOKS")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(circulationService.getIssuedCirculations());
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        if (!permissionService.hasPermission("SEARCH_BOOKS") &&
            !permissionService.hasPermission("ISSUE_RETURN_BOOKS")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(bookService.getAllCategories());
    }
}