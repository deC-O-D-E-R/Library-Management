package com.cdot.library_management.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CirculationResponseDTO {

    private Integer circulationId;
    private Integer copyId;
    private String accessionNumber;
    private Integer bookId;
    private String bookTitle;
    private String callNumber;
    private Integer userId;
    private String userName;
    private String staffNumber;
    private Integer issuedById;
    private String issuedByName;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private String status;
    private LocalDateTime createdAt;

    public CirculationResponseDTO(Integer circulationId, Integer copyId,
                                   String accessionNumber, Integer bookId,
                                   String bookTitle, String callNumber,
                                   Integer userId, String userName,
                                   String staffNumber, Integer issuedById,
                                   String issuedByName, LocalDate issueDate,
                                   LocalDate dueDate, LocalDate returnDate,
                                   String status, LocalDateTime createdAt) {
        this.circulationId = circulationId;
        this.copyId = copyId;
        this.accessionNumber = accessionNumber;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.callNumber = callNumber;
        this.userId = userId;
        this.userName = userName;
        this.staffNumber = staffNumber;
        this.issuedById = issuedById;
        this.issuedByName = issuedByName;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters
    public Integer getCirculationId() { return circulationId; }
    public Integer getCopyId() { return copyId; }
    public String getAccessionNumber() { return accessionNumber; }
    public Integer getBookId() { return bookId; }
    public String getBookTitle() { return bookTitle; }
    public String getCallNumber() { return callNumber; }
    public Integer getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getStaffNumber() { return staffNumber; }
    public Integer getIssuedById() { return issuedById; }
    public String getIssuedByName() { return issuedByName; }
    public LocalDate getIssueDate() { return issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public LocalDate getReturnDate() { return returnDate; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}