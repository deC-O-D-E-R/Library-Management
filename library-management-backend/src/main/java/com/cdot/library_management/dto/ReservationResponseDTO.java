package com.cdot.library_management.dto;

import java.time.LocalDateTime;

public class ReservationResponseDTO {

    private Integer reservationId;
    private Integer bookId;
    private String bookTitle;
    private String callNumber;
    private String isbn;
    private Integer userId;
    private String userName;
    private String staffNumber;
    private String status;
    private LocalDateTime reservedAt;
    private LocalDateTime notifiedAt;

    public ReservationResponseDTO(Integer reservationId, Integer bookId,
                                   String bookTitle, String callNumber,
                                   String isbn, Integer userId,
                                   String userName, String staffNumber,
                                   String status, LocalDateTime reservedAt,
                                   LocalDateTime notifiedAt) {
        this.reservationId = reservationId;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.callNumber = callNumber;
        this.isbn = isbn;
        this.userId = userId;
        this.userName = userName;
        this.staffNumber = staffNumber;
        this.status = status;
        this.reservedAt = reservedAt;
        this.notifiedAt = notifiedAt;
    }

    // Getters
    public Integer getReservationId() { return reservationId; }
    public Integer getBookId() { return bookId; }
    public String getBookTitle() { return bookTitle; }
    public String getCallNumber() { return callNumber; }
    public String getIsbn() { return isbn; }
    public Integer getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getStaffNumber() { return staffNumber; }
    public String getStatus() { return status; }
    public LocalDateTime getReservedAt() { return reservedAt; }
    public LocalDateTime getNotifiedAt() { return notifiedAt; }
}