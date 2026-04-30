package com.cdot.library_management.controller;

import com.cdot.library_management.dto.BookRequestDTO;
import com.cdot.library_management.dto.BookResponseDTO;
import com.cdot.library_management.dto.BulkUploadResponse;
import com.cdot.library_management.service.BookService;
import com.cdot.library_management.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/librarian/books")
public class LibrarianBookController {

    private final BookService bookService;
    private final PermissionService permissionService;

    public LibrarianBookController(BookService bookService,
                                    PermissionService permissionService) {
        this.bookService = bookService;
        this.permissionService = permissionService;
    }

    @GetMapping
    public ResponseEntity<?> getAllBooks() {
        if (!permissionService.hasPermission("MANAGE_BOOKS")) {
            return ResponseEntity.status(403).body("Access denied");
        }
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<?> getBookById(@PathVariable Integer bookId) {
        if (!permissionService.hasPermission("MANAGE_BOOKS")) {
            return ResponseEntity.status(403).body("Access denied");
        }
        try {
            return ResponseEntity.ok(bookService.getBookById(bookId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String callNumber) {
        if (!permissionService.hasPermission("MANAGE_BOOKS")) {
            return ResponseEntity.status(403).body("Access denied");
        }
        return ResponseEntity.ok(bookService.searchBooks(title, author, isbn, callNumber));
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        if (!permissionService.hasPermission("MANAGE_BOOKS")) {
            return ResponseEntity.status(403).body("Access denied");
        }
        return ResponseEntity.ok(bookService.getAllCategories());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getBooksByCategory(@PathVariable Integer categoryId) {
        if (!permissionService.hasPermission("MANAGE_BOOKS")) {
            return ResponseEntity.status(403).body("Access denied");
        }
        return ResponseEntity.ok(bookService.getBooksByCategory(categoryId));
    }

    @PostMapping
    public ResponseEntity<?> addBook(@RequestBody BookRequestDTO request) {
        if (!permissionService.hasPermission("MANAGE_BOOKS")) {
            return ResponseEntity.status(403).body("You do not have permission to manage books");
        }
        try {
            return ResponseEntity.status(201).body(bookService.addBook(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{bookId}")
    public ResponseEntity<?> editBook(@PathVariable Integer bookId,
                                       @RequestBody BookRequestDTO request) {
        if (!permissionService.hasPermission("MANAGE_BOOKS")) {
            return ResponseEntity.status(403).body("You do not have permission to manage books");
        }
        try {
            return ResponseEntity.ok(bookService.editBook(bookId, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<?> deleteBook(@PathVariable Integer bookId) {
        if (!permissionService.hasPermission("MANAGE_BOOKS")) {
            return ResponseEntity.status(403).body("You do not have permission to manage books");
        }
        try {
            bookService.deleteBook(bookId);
            return ResponseEntity.ok("Book deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{bookId}/copies")
    public ResponseEntity<?> addCopy(@PathVariable Integer bookId,
                                      @RequestParam String accessionNumber) {
        if (!permissionService.hasPermission("MANAGE_BOOKS")) {
            return ResponseEntity.status(403).body("You do not have permission to manage books");
        }
        try {
            return ResponseEntity.status(201).body(bookService.addCopy(bookId, accessionNumber));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/copies/{copyId}")
    public ResponseEntity<?> deleteCopy(@PathVariable Integer copyId) {
        if (!permissionService.hasPermission("MANAGE_BOOKS")) {
            return ResponseEntity.status(403).body("You do not have permission to manage books");
        }
        try {
            bookService.deleteCopy(copyId);
            return ResponseEntity.ok("Copy deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUploadBooks(@RequestParam("file") MultipartFile file) {
        if (!permissionService.hasPermission("MANAGE_BOOKS")) {
            return ResponseEntity.status(403).body("You do not have permission to manage books");
        }
        try {
            return ResponseEntity.ok(bookService.bulkUploadBooks(file));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}