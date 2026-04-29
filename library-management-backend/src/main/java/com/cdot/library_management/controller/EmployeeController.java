package com.cdot.library_management.controller;

import com.cdot.library_management.dto.BookResponseDTO;
import com.cdot.library_management.dto.CirculationResponseDTO;
import com.cdot.library_management.dto.FineResponseDTO;
import com.cdot.library_management.dto.ChangePasswordRequest;
import com.cdot.library_management.entity.User;
import com.cdot.library_management.repository.UserRepository;
import com.cdot.library_management.service.BookService;
import com.cdot.library_management.service.UserService;
import com.cdot.library_management.service.CirculationService;
import com.cdot.library_management.service.SystemConfigService;
import com.cdot.library_management.service.FineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/employee")
public class EmployeeController {

    private final BookService bookService;
    private final UserService userService;
    private final CirculationService circulationService;
    private final FineService fineService;
    private final UserRepository userRepository;
    private final SystemConfigService systemConfigService;

    public EmployeeController(BookService bookService,
                               UserService userService,
                               CirculationService circulationService,
                               FineService fineService,
                               UserRepository userRepository,
                               SystemConfigService systemConfigService) {
        this.bookService = bookService;
        this.userService = userService;
        this.circulationService = circulationService;
        this.fineService = fineService;
        this.userRepository = userRepository;
        this.systemConfigService = systemConfigService;
    }


    @GetMapping("/me")
    public ResponseEntity<?> getMyDetails() {
        try {
            User user = getLoggedInUser();
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/books/search")
    public ResponseEntity<List<BookResponseDTO>> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String callNumber) {
        return ResponseEntity.ok(bookService.searchBooks(title, author, isbn, callNumber));
    }

    @GetMapping("/books/{bookId}")
    public ResponseEntity<?> getBookById(@PathVariable Integer bookId) {
        try {
            BookResponseDTO response = bookService.getBookById(bookId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/circulation/my")
    public ResponseEntity<?> getMyIssuedBooks() {
        try {
            User user = getLoggedInUser();
            List<CirculationResponseDTO> response = circulationService
                    .getCirculationByUser(user.getUserId())
                    .stream()
                    .filter(c -> c.getStatus().equals("issued"))
                    .toList();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/circulation/history")
    public ResponseEntity<?> getMyHistory() {
        try {
            User user = getLoggedInUser();
            List<CirculationResponseDTO> response = circulationService
                    .getCirculationByUser(user.getUserId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/fines/system/fine-enabled")
    public ResponseEntity<Boolean> isFineSystemEnabled() {
        return ResponseEntity.ok(systemConfigService.isFineSystemEnabled());
    }

    @GetMapping("/fines/my")
    public ResponseEntity<?> getMyFines() {
        try {
            User user = getLoggedInUser();
            List<FineResponseDTO> response = fineService
                    .getFinesByUser(user.getUserId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private User getLoggedInUser() {
        String staffNumber = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));
    }

    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            org.springframework.security.core.Authentication authentication) {
        try {
            userService.changePassword(authentication.getName(), request);
            return ResponseEntity.ok("Password changed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/files/{type}")
    public ResponseEntity<?> downloadFile(@PathVariable String type) {
        try {
            String configKey;

            if ("rules".equalsIgnoreCase(type)) {
                configKey = "rules_pdf_path";
            } else if ("book-request".equalsIgnoreCase(type)) {
                configKey = "book_request_pdf_path";
            } else {
                return ResponseEntity.badRequest().build();
            }

            String filePath = systemConfigService.getValue(configKey);

            Path path = Paths.get(filePath).toAbsolutePath().normalize();
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + type + ".pdf")
                .body(resource);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid file type");
        }
    }

}