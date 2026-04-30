package com.cdot.library_management.dto;

import java.util.List;

public class CreateSystemAccountRequest {

    private String accountName;
    private String username;
    private String email;
    private String role;
    private List<String> permissions;
    private String password;

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}