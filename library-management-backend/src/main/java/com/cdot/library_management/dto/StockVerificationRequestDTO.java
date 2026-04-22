package com.cdot.library_management.dto;

import java.util.List;

public class StockVerificationRequestDTO {

    private String scopeType;
    private String scopeValue;
    private List<AssignmentRequestDTO> assignments;

    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }

    public String getScopeValue() { return scopeValue; }
    public void setScopeValue(String scopeValue) { this.scopeValue = scopeValue; }

    public List<AssignmentRequestDTO> getAssignments() { return assignments; }
    public void setAssignments(List<AssignmentRequestDTO> assignments) { this.assignments = assignments; }

    public static class AssignmentRequestDTO {

        private Integer userId;
        private String scopeType;
        private String scopeFrom;
        private String scopeTo;

        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }

        public String getScopeType() { return scopeType; }
        public void setScopeType(String scopeType) { this.scopeType = scopeType; }

        public String getScopeFrom() { return scopeFrom; }
        public void setScopeFrom(String scopeFrom) { this.scopeFrom = scopeFrom; }

        public String getScopeTo() { return scopeTo; }
        public void setScopeTo(String scopeTo) { this.scopeTo = scopeTo; }
    }
}