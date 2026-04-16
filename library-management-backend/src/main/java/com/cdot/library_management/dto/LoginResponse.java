package com.cdot.library_management.dto;

import java.util.List;

public class LoginResponse {

    private String token;
    private String staffNumber;
    private String name;
    private String email;
    private List<String> roles;

    // Constructor
    public LoginResponse(String token, String staffNumber, String name, String email, List<String> roles) {
        this.token = token;
        this.staffNumber = staffNumber;
        this.name = name;
        this.email = email;
        this.roles = roles;
    }

    // Getters
    public String getToken() { return token; }
    public String getStaffNumber() { return staffNumber; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public List<String> getRoles() { return roles; }
}