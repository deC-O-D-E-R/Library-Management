package com.cdot.library_management.dto;

public class LoginRequest {

    private String staffNumber;
    private String password;

    //getters and setters
    public String getStaffNumber() { return staffNumber; }
    public void setStaffNumber(String staffNumber) { this.staffNumber = staffNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}