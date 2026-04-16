package com.cdot.library_management.dto;

import java.time.LocalDate;
import java.util.List;

public class UserRequestDTO {

    private String name;
    private String staffNumber;
    private String password;
    private String designation;
    private String email;
    private LocalDate dateOfJoining;
    private LocalDate dateOfSuperannuation;
    private LocalDate dateOfResignation;
    private List<String> roles;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStaffNumber() { return staffNumber; }
    public void setStaffNumber(String staffNumber) { this.staffNumber = staffNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getDateOfJoining() { return dateOfJoining; }
    public void setDateOfJoining(LocalDate dateOfJoining) { this.dateOfJoining = dateOfJoining; }

    public LocalDate getDateOfSuperannuation() { return dateOfSuperannuation; }
    public void setDateOfSuperannuation(LocalDate dateOfSuperannuation) { this.dateOfSuperannuation = dateOfSuperannuation; }

    public LocalDate getDateOfResignation() { return dateOfResignation; }
    public void setDateOfResignation(LocalDate dateOfResignation) { this.dateOfResignation = dateOfResignation; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}