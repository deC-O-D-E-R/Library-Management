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
    private List<ScanDetailDTO> details;

    public StockVerificationResponseDTO(Integer verificationId, Integer initiatedById,
                                         String initiatedByName, String scopeType,
                                         String scopeValue, String status,
                                         LocalDateTime startedAt, LocalDateTime completedAt,
                                         int totalScanned, int availableCount,
                                         int issuedCount, int missingCount,
                                         int damagedCount, List<ScanDetailDTO> details) {
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
        this.details = details;
    }

    // Getters
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
    public List<ScanDetailDTO> getDetails() { return details; }

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

        public ScanDetailDTO(Integer detailId, Integer copyId, String accessionNumber,
                              String bookTitle, String callNumber, String previousStatus,
                              String markedStatus, boolean statusChanged,
                              LocalDateTime verifiedAt) {
            this.detailId = detailId;
            this.copyId = copyId;
            this.accessionNumber = accessionNumber;
            this.bookTitle = bookTitle;
            this.callNumber = callNumber;
            this.previousStatus = previousStatus;
            this.markedStatus = markedStatus;
            this.statusChanged = statusChanged;
            this.verifiedAt = verifiedAt;
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
    }
}