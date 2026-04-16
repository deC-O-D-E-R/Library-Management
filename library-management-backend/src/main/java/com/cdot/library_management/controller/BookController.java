package com.cdot.library_management.controller;

import com.cdot.library_management.dto.BookRequestDTO;
import com.cdot.library_management.dto.BookResponseDTO;
import com.cdot.library_management.dto.BulkUploadResponse;
import com.cdot.library_management.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    public ResponseEntity<?> addBook(@RequestBody BookRequestDTO request) {
        try {
            BookResponseDTO response = bookService.addBook(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{bookId}")
    public ResponseEntity<?> editBook(@PathVariable Integer bookId,
                                      @RequestBody BookRequestDTO request) {
        try {
            BookResponseDTO response = bookService.editBook(bookId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<?> deleteBook(@PathVariable Integer bookId) {
        try {
            bookService.deleteBook(bookId);
            return ResponseEntity.ok("Book deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<BookResponseDTO>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<?> getBookById(@PathVariable Integer bookId) {
        try {
            BookResponseDTO response = bookService.getBookById(bookId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<BookResponseDTO>> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String callNumber) {
        return ResponseEntity.ok(bookService.searchBooks(title, author, isbn, callNumber));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<BookResponseDTO>> getBooksByCategory(
            @PathVariable Integer categoryId) {
        return ResponseEntity.ok(bookService.getBooksByCategory(categoryId));
    }

    @PostMapping("/{bookId}/copies")
    public ResponseEntity<?> addCopy(@PathVariable Integer bookId,
                                     @RequestParam String accessionNumber) {
        try {
            BookResponseDTO response = bookService.addCopy(bookId, accessionNumber);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/copies/{copyId}")
    public ResponseEntity<?> deleteCopy(@PathVariable Integer copyId) {
        try {
            bookService.deleteCopy(copyId);
            return ResponseEntity.ok("Copy deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUploadBooks(@RequestParam("file") MultipartFile file) {
        try {
            BulkUploadResponse response = bookService.bulkUploadBooks(file);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}