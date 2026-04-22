package com.cdot.library_management.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_assignment")
public class VerificationAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Integer assignmentId;

    @ManyToOne
    @JoinColumn(name = "verification_id", nullable = false)
    private StockVerification stockVerification;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "emp_id", nullable = false)
    private String empId;

    @Column(name = "designation")
    private String designation;

    @Column(name = "scope_type", nullable = false)
    private String scopeType;

    @Column(name = "scope_from")
    private String scopeFrom;

    @Column(name = "scope_to")
    private String scopeTo;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Integer getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Integer assignmentId) { this.assignmentId = assignmentId; }

    public StockVerification getStockVerification() { return stockVerification; }
    public void setStockVerification(StockVerification stockVerification) { this.stockVerification = stockVerification; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmpId() { return empId; }
    public void setEmpId(String empId) { this.empId = empId; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }

    public String getScopeFrom() { return scopeFrom; }
    public void setScopeFrom(String scopeFrom) { this.scopeFrom = scopeFrom; }

    public String getScopeTo() { return scopeTo; }
    public void setScopeTo(String scopeTo) { this.scopeTo = scopeTo; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}