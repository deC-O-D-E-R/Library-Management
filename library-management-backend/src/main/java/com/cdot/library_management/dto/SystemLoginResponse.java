package com.cdot.library_management.dto;

public class SystemLoginResponse {

    private String token;
    private String username;
    private String accountName;
    private String email;
    private String role;

    public SystemLoginResponse(String token, String username, String accountName, String email, String role) {
        this.token = token;
        this.username = username;
        this.accountName = accountName;
        this.email = email;
        this.role = role;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
    public String getAccountName() { return accountName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}