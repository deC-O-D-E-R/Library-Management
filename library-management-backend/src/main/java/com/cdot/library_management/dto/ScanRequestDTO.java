package com.cdot.library_management.dto;

public class ScanRequestDTO {

    private String accessionNumber;
    private String markedStatus;

    // Getters and Setters
    public String getAccessionNumber() { return accessionNumber; }
    public void setAccessionNumber(String accessionNumber) { this.accessionNumber = accessionNumber; }

    public String getMarkedStatus() { return markedStatus; }
    public void setMarkedStatus(String markedStatus) { this.markedStatus = markedStatus; }
}