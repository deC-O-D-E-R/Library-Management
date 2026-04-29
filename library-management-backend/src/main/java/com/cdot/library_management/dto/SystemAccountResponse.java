package com.cdot.library_management.dto;

import java.time.LocalDateTime;

public class SystemAccountResponse {

    private Integer accountId;
    private String accountName;
    private String username;
    private String email;
    private String role;
    private Boolean isActive;
    private LocalDateTime lastLogin;
    private String createdBy;
    private LocalDateTime createdAt;

    public SystemAccountResponse(Integer accountId, String accountName, String username,
                                  String email, String role, Boolean isActive,
                                  String createdBy, LocalDateTime createdAt,
                                  LocalDateTime lastLogin) {
        this.accountId = accountId;
        this.accountName = accountName;
        this.username = username;
        this.email = email;
        this.role = role;
        this.isActive = isActive;
        this.lastLogin = lastLogin;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public Integer getAccountId() { return accountId; }
    public String getAccountName() { return accountName; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Boolean getIsActive() { return isActive; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}