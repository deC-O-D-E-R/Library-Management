package com.cdot.library_management.dto;

public class ScanRequestDTO {

    private String accessionNumber;
    private String markedStatus;
    private Integer assignmentId;
    private String remarks;

    public String getAccessionNumber() { return accessionNumber; }
    public void setAccessionNumber(String accessionNumber) { this.accessionNumber = accessionNumber; }

    public String getMarkedStatus() { return markedStatus; }
    public void setMarkedStatus(String markedStatus) { this.markedStatus = markedStatus; }

    public Integer getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Integer assignmentId) { this.assignmentId = assignmentId; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}