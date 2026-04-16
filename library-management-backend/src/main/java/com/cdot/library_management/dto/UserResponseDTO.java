package com.cdot.library_management.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class UserResponseDTO {

    private Integer userId;
    private String name;
    private String staffNumber;
    private String designation;
    private String email;
    private LocalDate dateOfJoining;
    private LocalDate dateOfSuperannuation;
    private LocalDate dateOfResignation;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> roles;

    // Constructor
    public UserResponseDTO(Integer userId, String name, String staffNumber,
                           String designation, String email, LocalDate dateOfJoining,
                           LocalDate dateOfSuperannuation, LocalDate dateOfResignation,
                           Boolean isActive, LocalDateTime createdAt,
                           LocalDateTime updatedAt, List<String> roles) {
        this.userId = userId;
        this.name = name;
        this.staffNumber = staffNumber;
        this.designation = designation;
        this.email = email;
        this.dateOfJoining = dateOfJoining;
        this.dateOfSuperannuation = dateOfSuperannuation;
        this.dateOfResignation = dateOfResignation;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.roles = roles;
    }

    // Getters
    public Integer getUserId() { return userId; }
    public String getName() { return name; }
    public String getStaffNumber() { return staffNumber; }
    public String getDesignation() { return designation; }
    public String getEmail() { return email; }
    public LocalDate getDateOfJoining() { return dateOfJoining; }
    public LocalDate getDateOfSuperannuation() { return dateOfSuperannuation; }
    public LocalDate getDateOfResignation() { return dateOfResignation; }
    public Boolean getIsActive() { return isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<String> getRoles() { return roles; }
}