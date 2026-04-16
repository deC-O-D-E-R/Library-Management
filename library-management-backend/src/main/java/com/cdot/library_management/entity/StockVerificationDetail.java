package com.cdot.library_management.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_verification_detail")
public class StockVerificationDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detail_id")
    private Integer detailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_id", nullable = false)
    private StockVerification stockVerification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "copy_id", nullable = false)
    private BookCopy bookCopy;

    @Column(name = "previous_status", nullable = false, length = 20)
    private String previousStatus;

    @Column(name = "marked_status", nullable = false, length = 20)
    private String markedStatus;

    @Column(name = "verified_at", nullable = false, updatable = false)
    private LocalDateTime verifiedAt;

    @PrePersist
    protected void onCreate() {
        verifiedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getDetailId() { return detailId; }
    public void setDetailId(Integer detailId) { this.detailId = detailId; }

    public StockVerification getStockVerification() { return stockVerification; }
    public void setStockVerification(StockVerification stockVerification) { this.stockVerification = stockVerification; }

    public BookCopy getBookCopy() { return bookCopy; }
    public void setBookCopy(BookCopy bookCopy) { this.bookCopy = bookCopy; }

    public String getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }

    public String getMarkedStatus() { return markedStatus; }
    public void setMarkedStatus(String markedStatus) { this.markedStatus = markedStatus; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
}