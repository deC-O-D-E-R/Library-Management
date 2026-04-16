package com.cdot.library_management.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fines")
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fine_id")
    private Integer fineId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "circulation_id", nullable = false, unique = true)
    private Circulation circulation;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "pending";

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collected_by")
    private User collectedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getFineId() { return fineId; }
    public void setFineId(Integer fineId) { this.fineId = fineId; }

    public Circulation getCirculation() { return circulation; }
    public void setCirculation(Circulation circulation) { this.circulation = circulation; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }

    public User getCollectedBy() { return collectedBy; }
    public void setCollectedBy(User collectedBy) { this.collectedBy = collectedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}