package com.cdot.library_management.dto;

import java.time.LocalDate;

public class CirculationRequestDTO {

    private Integer userId;
    private Integer copyId;
    private LocalDate issueDate;
    private LocalDate dueDate;

    // Getters and Setters
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getCopyId() { return copyId; }
    public void setCopyId(Integer copyId) { this.copyId = copyId; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}