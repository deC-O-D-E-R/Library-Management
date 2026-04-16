package com.cdot.library_management.service;

import com.cdot.library_management.dto.BookResponseDTO;
import com.cdot.library_management.dto.CirculationResponseDTO;
import com.cdot.library_management.dto.FineResponseDTO;
import com.cdot.library_management.dto.StockVerificationResponseDTO;
import com.cdot.library_management.entity.Book;
import com.cdot.library_management.entity.BookCopy;
import com.cdot.library_management.entity.Category;
import com.cdot.library_management.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final CirculationRepository circulationRepository;
    private final FineRepository fineRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final StockVerificationService stockVerificationService;
    private final CirculationService circulationService;
    private final FineService fineService;
    private final BookService bookService;

    public ReportService(CirculationRepository circulationRepository,
                          FineRepository fineRepository,
                          BookRepository bookRepository,
                          BookCopyRepository bookCopyRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository,
                          StockVerificationService stockVerificationService,
                          CirculationService circulationService,
                          FineService fineService,
                          BookService bookService) {
        this.circulationRepository = circulationRepository;
        this.fineRepository = fineRepository;
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.stockVerificationService = stockVerificationService;
        this.circulationService = circulationService;
        this.fineService = fineService;
        this.bookService = bookService;
    }

    //circulation report (filter by status)
    public List<CirculationResponseDTO> getCirculationReport(String status) {
        if (status != null && !status.isBlank()) {
            return circulationService.getAllCirculations()
                    .stream()
                    .filter(c -> c.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }
        return circulationService.getAllCirculations();
    }

    //user wise borrowing report
    public Map<String, Object> getUserBorrowingReport(Integer userId) {

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<CirculationResponseDTO> history = circulationService.getCirculationByUser(userId);
        List<FineResponseDTO> fines = fineService.getFinesByUser(userId);

        long totalBorrowed = history.size();
        long currentlyIssued = history.stream()
                .filter(c -> c.getStatus().equals("issued")).count();
        long returned = history.stream()
                .filter(c -> c.getStatus().equals("returned")).count();
        long overdue = history.stream()
                .filter(c -> c.getStatus().equals("overdue")).count();
        long pendingFines = fines.stream()
                .filter(f -> f.getStatus().equals("pending")).count();

        Map<String, Object> report = new HashMap<>();
        report.put("userId", user.getUserId());
        report.put("name", user.getName());
        report.put("staffNumber", user.getStaffNumber());
        report.put("totalBorrowed", totalBorrowed);
        report.put("currentlyIssued", currentlyIssued);
        report.put("returned", returned);
        report.put("overdue", overdue);
        report.put("pendingFines", pendingFines);
        report.put("circulationHistory", history);
        report.put("fines", fines);

        return report;
    }

    //inventory report (all books with copy counts)
    public List<BookResponseDTO> getInventoryReport() {
        return bookService.getAllBooks();
    }

    //holding summary (category wise)
    public List<Map<String, Object>> getHoldingSummary() {

        List<Category> categories = categoryRepository.findAll();
        List<Map<String, Object>> summary = new ArrayList<>();

        int grandTotalCopies = 0;
        int grandAvailable = 0;
        int grandIssued = 0;
        int grandMissingDamaged = 0;

        for (Category category : categories) {
            List<Book> books = bookRepository.findByCategory_CategoryId(category.getCategoryId());

            int totalCopies = 0;
            int available = 0;
            int issued = 0;
            int missingDamaged = 0;

            for (Book book : books) {
                List<BookCopy> copies = bookCopyRepository.findByBook_BookId(book.getBookId());
                totalCopies += copies.size();
                available += copies.stream().filter(c -> c.getStatus().equals("available")).count();
                issued += copies.stream().filter(c -> c.getStatus().equals("issued")).count();
                missingDamaged += copies.stream()
                        .filter(c -> c.getStatus().equals("missing")
                                || c.getStatus().equals("damaged")).count();
            }

            grandTotalCopies += totalCopies;
            grandAvailable += available;
            grandIssued += issued;
            grandMissingDamaged += missingDamaged;

            Map<String, Object> categoryReport = new HashMap<>();
            categoryReport.put("categoryId", category.getCategoryId());
            categoryReport.put("categoryName", category.getName());
            categoryReport.put("totalBooks", books.size());
            categoryReport.put("totalCopies", totalCopies);
            categoryReport.put("available", available);
            categoryReport.put("issued", issued);
            categoryReport.put("missingDamaged", missingDamaged);
            summary.add(categoryReport);
        }

        Map<String, Object> grandTotal = new HashMap<>();
        grandTotal.put("categoryId", null);
        grandTotal.put("categoryName", "GRAND TOTAL");
        grandTotal.put("totalBooks", bookRepository.count());
        grandTotal.put("totalCopies", grandTotalCopies);
        grandTotal.put("available", grandAvailable);
        grandTotal.put("issued", grandIssued);
        grandTotal.put("missingDamaged", grandMissingDamaged);
        summary.add(grandTotal);

        return summary;
    }

    //overdue report with fine details
    public List<Map<String, Object>> getOverdueReport() {

        return circulationRepository.findByDueDateBeforeAndStatus(LocalDate.now(), "issued")
                .stream()
                .map(circulation -> {
                    long daysOverdue = LocalDate.now().toEpochDay()
                            - circulation.getDueDate().toEpochDay();

                    Map<String, Object> record = new HashMap<>();
                    record.put("circulationId", circulation.getCirculationId());
                    record.put("staffNumber", circulation.getUser().getStaffNumber());
                    record.put("userName", circulation.getUser().getName());
                    record.put("email", circulation.getUser().getEmail());
                    record.put("bookTitle", circulation.getBookCopy().getBook().getTitle());
                    record.put("accessionNumber", circulation.getBookCopy().getAccessionNumber());
                    record.put("issueDate", circulation.getIssueDate());
                    record.put("dueDate", circulation.getDueDate());
                    record.put("daysOverdue", daysOverdue);
                    record.put("estimatedFine", daysOverdue * 2.00);
                    return record;
                })
                .collect(Collectors.toList());
    }

    //stock verification report
    public StockVerificationResponseDTO getStockVerificationReport(Integer verificationId) {
        return stockVerificationService.getDiscrepancyReport(verificationId);
    }
}