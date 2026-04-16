package com.cdot.library_management.service;

import com.cdot.library_management.dto.BookRequestDTO;
import com.cdot.library_management.dto.BookResponseDTO;
import com.cdot.library_management.dto.BulkUploadResponse;
import com.cdot.library_management.entity.Book;
import com.cdot.library_management.entity.BookCopy;
import com.cdot.library_management.entity.Category;
import com.cdot.library_management.repository.BookCopyRepository;
import com.cdot.library_management.repository.BookRepository;
import com.cdot.library_management.repository.CategoryRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final CategoryRepository categoryRepository;

    public BookService(BookRepository bookRepository,
                       BookCopyRepository bookCopyRepository,
                       CategoryRepository categoryRepository) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.categoryRepository = categoryRepository;
    }

    //add single book with copies
    @Transactional
    public BookResponseDTO addBook(BookRequestDTO request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        if (request.getIsbn() != null && !request.getIsbn().isBlank()) {
            if (bookRepository.findByIsbn(request.getIsbn()).isPresent()) {
                throw new RuntimeException("ISBN already exists: " + request.getIsbn());
            }
        }

        Book book = new Book();
        book.setCategory(category);
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setCallNumber(request.getCallNumber());
        book.setVendorName(request.getVendorName());
        book.setInvoiceNo(request.getInvoiceNo());
        book.setPrice(request.getPrice());
        book.setReceiptDate(request.getReceiptDate());

        Book savedBook = bookRepository.save(book);

        if (request.getAccessionNumbers() != null) {
            for (String accessionNumber : request.getAccessionNumbers()) {
                if (bookCopyRepository.findByAccessionNumber(accessionNumber).isPresent()) {
                    throw new RuntimeException("Accession number already exists: " + accessionNumber);
                }
                BookCopy copy = new BookCopy();
                copy.setBook(savedBook);
                copy.setAccessionNumber(accessionNumber);
                copy.setStatus("available");
                bookCopyRepository.save(copy);
            }
        }

        return mapToResponseDTO(savedBook);
    }

    //edit book
    @Transactional
    public BookResponseDTO editBook(Integer bookId, BookRequestDTO request) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        if (request.getIsbn() != null && !request.getIsbn().isBlank()
                && !request.getIsbn().equals(book.getIsbn())) {
            if (bookRepository.findByIsbn(request.getIsbn()).isPresent()) {
                throw new RuntimeException("ISBN already exists: " + request.getIsbn());
            }
        }

        book.setCategory(category);
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setCallNumber(request.getCallNumber());
        book.setVendorName(request.getVendorName());
        book.setInvoiceNo(request.getInvoiceNo());
        book.setPrice(request.getPrice());
        book.setReceiptDate(request.getReceiptDate());

        Book savedBook = bookRepository.save(book);
        return mapToResponseDTO(savedBook);
    }

    //delete book
    @Transactional
    public void deleteBook(Integer bookId) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        List<BookCopy> copies = bookCopyRepository.findByBook_BookId(bookId);
        boolean hasIssuedCopies = copies.stream()
                .anyMatch(c -> c.getStatus().equals("issued"));

        if (hasIssuedCopies) {
            throw new RuntimeException("Cannot delete book — one or more copies are currently issued");
        }

        bookCopyRepository.deleteAll(copies);
        bookRepository.delete(book);
    }

    //get all books
    public List<BookResponseDTO> getAllBooks() {
        return bookRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //get book by ID
    public BookResponseDTO getBookById(Integer bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));
        return mapToResponseDTO(book);
    }

    //search books
    public List<BookResponseDTO> searchBooks(String title, String author,
                                              String isbn, String callNumber) {
        if (isbn != null && !isbn.isBlank()) {
            return bookRepository.findByIsbn(isbn)
                    .map(b -> List.of(mapToResponseDTO(b)))
                    .orElse(List.of());
        }
        if (title != null && !title.isBlank()) {
            return bookRepository.findByTitleContainingIgnoreCase(title)
                    .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
        }
        if (author != null && !author.isBlank()) {
            return bookRepository.findByAuthorContainingIgnoreCase(author)
                    .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
        }
        if (callNumber != null && !callNumber.isBlank()) {
            return bookRepository.findByCallNumberContainingIgnoreCase(callNumber)
                    .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
        }
        return getAllBooks();
    }

    //get books by category
    public List<BookResponseDTO> getBooksByCategory(Integer categoryId) {
        return bookRepository.findByCategory_CategoryId(categoryId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //add copy to existing book
    @Transactional
    public BookResponseDTO addCopy(Integer bookId, String accessionNumber) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        if (bookCopyRepository.findByAccessionNumber(accessionNumber).isPresent()) {
            throw new RuntimeException("Accession number already exists: " + accessionNumber);
        }

        BookCopy copy = new BookCopy();
        copy.setBook(book);
        copy.setAccessionNumber(accessionNumber);
        copy.setStatus("available");
        bookCopyRepository.save(copy);

        return mapToResponseDTO(book);
    }

    //delete copy
    @Transactional
    public void deleteCopy(Integer copyId) {

        BookCopy copy = bookCopyRepository.findById(copyId)
                .orElseThrow(() -> new RuntimeException("Copy not found with id: " + copyId));

        if (copy.getStatus().equals("issued")) {
            throw new RuntimeException("Cannot delete copy — it is currently issued");
        }

        bookCopyRepository.delete(copy);
    }

    //bulk upload books
    public BulkUploadResponse bulkUploadBooks(MultipartFile file) {

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new RuntimeException("Invalid file");
        }
        if (filename.endsWith(".csv")) {
            return bulkUploadFromCSV(file);
        } else if (filename.endsWith(".xlsx")) {
            return bulkUploadFromExcel(file);
        } else {
            throw new RuntimeException("Only .csv and .xlsx files are supported");
        }
    }

    private BulkUploadResponse bulkUploadFromCSV(MultipartFile file) {

        List<BulkUploadResponse.BulkUploadError> errors = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line;
            int rowNum = 0;

            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (rowNum == 1) continue;

                String[] cols = line.split(",");
                totalRows++;

                try {
                    BookRequestDTO dto = mapColumnsToDTO(cols, rowNum);
                    addBook(dto);
                    successRows++;
                } catch (Exception e) {
                    String isbn = cols.length > 2 ? cols[2].trim() : "N/A";
                    errors.add(new BulkUploadResponse.BulkUploadError(
                            rowNum, isbn, e.getMessage()));
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to read CSV file: " + e.getMessage());
        }

        return new BulkUploadResponse(totalRows, successRows, totalRows - successRows, errors);
    }

    private BulkUploadResponse bulkUploadFromExcel(MultipartFile file) {

        List<BulkUploadResponse.BulkUploadError> errors = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            for (int rowNum = 1; rowNum <= sheet.getLastRowNum(); rowNum++) {
                Row row = sheet.getRow(rowNum);
                if (row == null) continue;

                totalRows++;

                try {
                    String[] cols = new String[10];
                    for (int i = 0; i < 10; i++) {
                        cols[i] = row.getCell(i) != null
                                ? formatter.formatCellValue(row.getCell(i)) : "";
                    }
                    BookRequestDTO dto = mapColumnsToDTO(cols, rowNum + 1);
                    addBook(dto);
                    successRows++;
                } catch (Exception e) {
                    String isbn = formatter.formatCellValue(row.getCell(2));
                    errors.add(new BulkUploadResponse.BulkUploadError(
                            rowNum + 1, isbn, e.getMessage()));
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to read Excel file: " + e.getMessage());
        }

        return new BulkUploadResponse(totalRows, successRows, totalRows - successRows, errors);
    }

    private BookRequestDTO mapColumnsToDTO(String[] cols, int rowNum) {

        if (cols.length < 5) {
            throw new RuntimeException("Row " + rowNum + " has insufficient columns");
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        BookRequestDTO dto = new BookRequestDTO();
        dto.setCategoryId(Integer.parseInt(cols[0].trim()));
        dto.setTitle(cols[1].trim());
        dto.setAuthor(cols[2].trim());
        dto.setIsbn(cols.length > 3 && !cols[3].trim().isEmpty() ? cols[3].trim() : null);
        dto.setCallNumber(cols[4].trim());
        dto.setVendorName(cols.length > 5 && !cols[5].trim().isEmpty() ? cols[5].trim() : null);
        dto.setInvoiceNo(cols.length > 6 && !cols[6].trim().isEmpty() ? cols[6].trim() : null);
        dto.setPrice(cols.length > 7 && !cols[7].trim().isEmpty()
                ? new BigDecimal(cols[7].trim()) : null);
        dto.setReceiptDate(
                cols.length > 8 ? parseDate(cols[8]) : null
        );
        dto.setAccessionNumbers(cols.length > 9 && !cols[9].trim().isEmpty()
                ? List.of(cols[9].trim().split(";")) : List.of());

        return dto;
    }

    //map Book entity to BookResponseDTO
    private BookResponseDTO mapToResponseDTO(Book book) {

        List<BookCopy> copies = bookCopyRepository.findByBook_BookId(book.getBookId());

        int totalCopies = copies.size();
        int availableCopies = (int) copies.stream()
                .filter(c -> c.getStatus().equals("available")).count();
        int issuedCopies = (int) copies.stream()
                .filter(c -> c.getStatus().equals("issued")).count();
        int missingDamagedCopies = (int) copies.stream()
                .filter(c -> c.getStatus().equals("missing")
                        || c.getStatus().equals("damaged")).count();

        List<BookResponseDTO.CopyDTO> copyDTOs = copies.stream()
                .map(c -> new BookResponseDTO.CopyDTO(
                        c.getCopyId(),
                        c.getAccessionNumber(),
                        c.getStatus()))
                .collect(Collectors.toList());

        return new BookResponseDTO(
                book.getBookId(),
                book.getCategory().getCategoryId(),
                book.getCategory().getName(),
                book.getTitle(),
                book.getAuthor(),
                book.getIsbn(),
                book.getCallNumber(),
                book.getVendorName(),
                book.getInvoiceNo(),
                book.getPrice(),
                book.getReceiptDate(),
                book.getCreatedAt(),
                book.getUpdatedAt(),
                totalCopies,
                availableCopies,
                issuedCopies,
                missingDamagedCopies,
                copyDTOs
        );
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) return null;

        dateStr = dateStr.trim();

        DateTimeFormatter[] formats = new DateTimeFormatter[]{
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy")
        };

        for (DateTimeFormatter formatter : formats) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (Exception ignored) {}
        }

        throw new RuntimeException("Invalid date format: " + dateStr);
    }
}