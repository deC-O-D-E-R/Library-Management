package com.cdot.library_management.dto;

import java.util.List;

public class BulkUploadResponse {

    private int totalRows;
    private int successRows;
    private int failedRows;
    private List<BulkUploadError> errors;

    public BulkUploadResponse(int totalRows, int successRows,
                               int failedRows, List<BulkUploadError> errors) {
        this.totalRows = totalRows;
        this.successRows = successRows;
        this.failedRows = failedRows;
        this.errors = errors;
    }

    public int getTotalRows() { return totalRows; }
    public int getSuccessRows() { return successRows; }
    public int getFailedRows() { return failedRows; }
    public List<BulkUploadError> getErrors() { return errors; }

    public static class BulkUploadError {
        private int row;
        private String staffNumber;
        private String reason;

        public BulkUploadError(int row, String staffNumber, String reason) {
            this.row = row;
            this.staffNumber = staffNumber;
            this.reason = reason;
        }

        public int getRow() { return row; }
        public String getStaffNumber() { return staffNumber; }
        public String getReason() { return reason; }
    }
}