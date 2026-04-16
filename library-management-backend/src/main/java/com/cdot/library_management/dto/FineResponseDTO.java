package com.cdot.library_management.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class FineResponseDTO {

    private Integer fineId;
    private Integer circulationId;
    private Integer userId;
    private String userName;
    private String staffNumber;
    private String bookTitle;
    private String accessionNumber;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private BigDecimal amount;
    private String status;
    private LocalDate paidDate;
    private Integer collectedById;
    private String collectedByName;
    private LocalDateTime createdAt;

    public FineResponseDTO(Integer fineId, Integer circulationId,
                           Integer userId, String userName, String staffNumber,
                           String bookTitle, String accessionNumber,
                           LocalDate issueDate, LocalDate dueDate,
                           LocalDate returnDate, BigDecimal amount,
                           String status, LocalDate paidDate,
                           Integer collectedById, String collectedByName,
                           LocalDateTime createdAt) {
        this.fineId = fineId;
        this.circulationId = circulationId;
        this.userId = userId;
        this.userName = userName;
        this.staffNumber = staffNumber;
        this.bookTitle = bookTitle;
        this.accessionNumber = accessionNumber;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.amount = amount;
        this.status = status;
        this.paidDate = paidDate;
        this.collectedById = collectedById;
        this.collectedByName = collectedByName;
        this.createdAt = createdAt;
    }

    // Getters
    public Integer getFineId() { return fineId; }
    public Integer getCirculationId() { return circulationId; }
    public Integer getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getStaffNumber() { return staffNumber; }
    public String getBookTitle() { return bookTitle; }
    public String getAccessionNumber() { return accessionNumber; }
    public LocalDate getIssueDate() { return issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public LocalDate getReturnDate() { return returnDate; }
    public BigDecimal getAmount() { return amount; }
    public String getStatus() { return status; }
    public LocalDate getPaidDate() { return paidDate; }
    public Integer getCollectedById() { return collectedById; }
    public String getCollectedByName() { return collectedByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}