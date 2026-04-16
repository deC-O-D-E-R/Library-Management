package com.cdot.library_management.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class BookResponseDTO {

    private Integer bookId;
    private Integer categoryId;
    private String categoryName;
    private String title;
    private String author;
    private String isbn;
    private String callNumber;
    private String vendorName;
    private String invoiceNo;
    private BigDecimal price;
    private LocalDate receiptDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int totalCopies;
    private int availableCopies;
    private int issuedCopies;
    private int missingDamagedCopies;
    private List<CopyDTO> copies;

    public BookResponseDTO(Integer bookId, Integer categoryId, String categoryName,
                           String title, String author, String isbn, String callNumber,
                           String vendorName, String invoiceNo, BigDecimal price,
                           LocalDate receiptDate, LocalDateTime createdAt,
                           LocalDateTime updatedAt, int totalCopies, int availableCopies,
                           int issuedCopies, int missingDamagedCopies, List<CopyDTO> copies) {
        this.bookId = bookId;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.callNumber = callNumber;
        this.vendorName = vendorName;
        this.invoiceNo = invoiceNo;
        this.price = price;
        this.receiptDate = receiptDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.issuedCopies = issuedCopies;
        this.missingDamagedCopies = missingDamagedCopies;
        this.copies = copies;
    }

    //getters
    public Integer getBookId() { return bookId; }
    public Integer getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getIsbn() { return isbn; }
    public String getCallNumber() { return callNumber; }
    public String getVendorName() { return vendorName; }
    public String getInvoiceNo() { return invoiceNo; }
    public BigDecimal getPrice() { return price; }
    public LocalDate getReceiptDate() { return receiptDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public int getTotalCopies() { return totalCopies; }
    public int getAvailableCopies() { return availableCopies; }
    public int getIssuedCopies() { return issuedCopies; }
    public int getMissingDamagedCopies() { return missingDamagedCopies; }
    public List<CopyDTO> getCopies() { return copies; }

    // Nested CopyDTO
    public static class CopyDTO {
        private Integer copyId;
        private String accessionNumber;
        private String status;

        public CopyDTO(Integer copyId, String accessionNumber, String status) {
            this.copyId = copyId;
            this.accessionNumber = accessionNumber;
            this.status = status;
        }

        public Integer getCopyId() { return copyId; }
        public String getAccessionNumber() { return accessionNumber; }
        public String getStatus() { return status; }
    }
}