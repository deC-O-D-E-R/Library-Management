package com.cdot.library_management.dto;

import java.time.LocalDateTime;
import java.util.List;

public class StockVerificationResponseDTO {

    private Integer verificationId;
    private Integer initiatedById;
    private String initiatedByName;
    private String scopeType;
    private String scopeValue;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private int totalScanned;
    private int availableCount;
    private int issuedCount;
    private int missingCount;
    private int damagedCount;
    private List<AssignmentDTO> assignments;
    private List<ScanDetailDTO> details;

    public StockVerificationResponseDTO(Integer verificationId, Integer initiatedById,
                                         String initiatedByName, String scopeType,
                                         String scopeValue, String status,
                                         LocalDateTime startedAt, LocalDateTime completedAt,
                                         int totalScanned, int availableCount,
                                         int issuedCount, int missingCount,
                                         int damagedCount, List<AssignmentDTO> assignments,
                                         List<ScanDetailDTO> details) {
        this.verificationId = verificationId;
        this.initiatedById = initiatedById;
        this.initiatedByName = initiatedByName;
        this.scopeType = scopeType;
        this.scopeValue = scopeValue;
        this.status = status;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.totalScanned = totalScanned;
        this.availableCount = availableCount;
        this.issuedCount = issuedCount;
        this.missingCount = missingCount;
        this.damagedCount = damagedCount;
        this.assignments = assignments;
        this.details = details;
    }

    public Integer getVerificationId() { return verificationId; }
    public Integer getInitiatedById() { return initiatedById; }
    public String getInitiatedByName() { return initiatedByName; }
    public String getScopeType() { return scopeType; }
    public String getScopeValue() { return scopeValue; }
    public String getStatus() { return status; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public int getTotalScanned() { return totalScanned; }
    public int getAvailableCount() { return availableCount; }
    public int getIssuedCount() { return issuedCount; }
    public int getMissingCount() { return missingCount; }
    public int getDamagedCount() { return damagedCount; }
    public List<AssignmentDTO> getAssignments() { return assignments; }
    public List<ScanDetailDTO> getDetails() { return details; }

    public static class AssignmentDTO {
        private Integer assignmentId;
        private Integer userId;
        private String name;
        private String empId;
        private String designation;
        private String scopeType;
        private String scopeFrom;
        private String scopeTo;
        private int scannedCount;

        public AssignmentDTO(Integer assignmentId, Integer userId, String name,
                              String empId, String designation, String scopeType,
                              String scopeFrom, String scopeTo, int scannedCount) {
            this.assignmentId = assignmentId;
            this.userId = userId;
            this.name = name;
            this.empId = empId;
            this.designation = designation;
            this.scopeType = scopeType;
            this.scopeFrom = scopeFrom;
            this.scopeTo = scopeTo;
            this.scannedCount = scannedCount;
        }

        public Integer getAssignmentId() { return assignmentId; }
        public Integer getUserId() { return userId; }
        public String getName() { return name; }
        public String getEmpId() { return empId; }
        public String getDesignation() { return designation; }
        public String getScopeType() { return scopeType; }
        public String getScopeFrom() { return scopeFrom; }
        public String getScopeTo() { return scopeTo; }
        public int getScannedCount() { return scannedCount; }
    }

    public static class ScanDetailDTO {
        private Integer detailId;
        private Integer copyId;
        private String accessionNumber;
        private String bookTitle;
        private String callNumber;
        private String previousStatus;
        private String markedStatus;
        private boolean statusChanged;
        private LocalDateTime verifiedAt;
        private Integer assignmentId;
        private String verifierName;

        public ScanDetailDTO(Integer detailId, Integer copyId, String accessionNumber,
                              String bookTitle, String callNumber, String previousStatus,
                              String markedStatus, boolean statusChanged,
                              LocalDateTime verifiedAt, Integer assignmentId,
                              String verifierName) {
            this.detailId = detailId;
            this.copyId = copyId;
            this.accessionNumber = accessionNumber;
            this.bookTitle = bookTitle;
            this.callNumber = callNumber;
            this.previousStatus = previousStatus;
            this.markedStatus = markedStatus;
            this.statusChanged = statusChanged;
            this.verifiedAt = verifiedAt;
            this.assignmentId = assignmentId;
            this.verifierName = verifierName;
        }

        public Integer getDetailId() { return detailId; }
        public Integer getCopyId() { return copyId; }
        public String getAccessionNumber() { return accessionNumber; }
        public String getBookTitle() { return bookTitle; }
        public String getCallNumber() { return callNumber; }
        public String getPreviousStatus() { return previousStatus; }
        public String getMarkedStatus() { return markedStatus; }
        public boolean isStatusChanged() { return statusChanged; }
        public LocalDateTime getVerifiedAt() { return verifiedAt; }
        public Integer getAssignmentId() { return assignmentId; }
        public String getVerifierName() { return verifierName; }
    }
}