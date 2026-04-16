package com.cdot.library_management.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Integer reservationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "pending";

    @Column(name = "reserved_at", nullable = false, updatable = false)
    private LocalDateTime reservedAt;

    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;

    @PrePersist
    protected void onCreate() {
        reservedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getReservationId() { return reservationId; }
    public void setReservationId(Integer reservationId) { this.reservationId = reservationId; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getReservedAt() { return reservedAt; }
    public void setReservedAt(LocalDateTime reservedAt) { this.reservedAt = reservedAt; }

    public LocalDateTime getNotifiedAt() { return notifiedAt; }
    public void setNotifiedAt(LocalDateTime notifiedAt) { this.notifiedAt = notifiedAt; }
}