package com.cdot.library_management.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PrintSheetDTO {

    private Integer verificationId;
    private Integer assignmentId;
    private String verifierName;
    private String verifierEmpId;
    private String verifierDesignation;
    private String scopeType;
    private String scopeFrom;
    private String scopeTo;
    private LocalDateTime startedAt;
    private List<PrintSheetRow> rows;

    public PrintSheetDTO(Integer verificationId, Integer assignmentId,
                          String verifierName, String verifierEmpId,
                          String verifierDesignation, String scopeType,
                          String scopeFrom, String scopeTo,
                          LocalDateTime startedAt, List<PrintSheetRow> rows) {
        this.verificationId = verificationId;
        this.assignmentId = assignmentId;
        this.verifierName = verifierName;
        this.verifierEmpId = verifierEmpId;
        this.verifierDesignation = verifierDesignation;
        this.scopeType = scopeType;
        this.scopeFrom = scopeFrom;
        this.scopeTo = scopeTo;
        this.startedAt = startedAt;
        this.rows = rows;
    }

    public Integer getVerificationId() { return verificationId; }
    public Integer getAssignmentId() { return assignmentId; }
    public String getVerifierName() { return verifierName; }
    public String getVerifierEmpId() { return verifierEmpId; }
    public String getVerifierDesignation() { return verifierDesignation; }
    public String getScopeType() { return scopeType; }
    public String getScopeFrom() { return scopeFrom; }
    public String getScopeTo() { return scopeTo; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public List<PrintSheetRow> getRows() { return rows; }

    public static class PrintSheetRow {
        private String accessionNumber;
        private String title;
        private String callNumber;
        private String expectedStatus;

        public PrintSheetRow(String accessionNumber, String title,
                              String callNumber, String expectedStatus) {
            this.accessionNumber = accessionNumber;
            this.title = title;
            this.callNumber = callNumber;
            this.expectedStatus = expectedStatus;
        }

        public String getAccessionNumber() { return accessionNumber; }
        public String getTitle() { return title; }
        public String getCallNumber() { return callNumber; }
        public String getExpectedStatus() { return expectedStatus; }
    }
}