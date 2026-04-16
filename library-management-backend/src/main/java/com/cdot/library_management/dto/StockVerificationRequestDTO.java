package com.cdot.library_management.dto;

public class StockVerificationRequestDTO {

    private String scopeType;
    private String scopeValue;

    // Getters and Setters
    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }

    public String getScopeValue() { return scopeValue; }
    public void setScopeValue(String scopeValue) { this.scopeValue = scopeValue; }
}