package com.cdot.library_management.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_verification")
public class StockVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "verification_id")
    private Integer verificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by", nullable = false)
    private User initiatedBy;

    @Column(name = "scope_type", nullable = false, length = 20)
    private String scopeType = "full";

    @Column(name = "scope_value", length = 100)
    private String scopeValue;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "in_progress";

    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getVerificationId() { return verificationId; }
    public void setVerificationId(Integer verificationId) { this.verificationId = verificationId; }

    public User getInitiatedBy() { return initiatedBy; }
    public void setInitiatedBy(User initiatedBy) { this.initiatedBy = initiatedBy; }

    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }

    public String getScopeValue() { return scopeValue; }
    public void setScopeValue(String scopeValue) { this.scopeValue = scopeValue; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}