package com.cdot.library_management.dto;

import java.time.LocalDateTime;

public class NotificationResponseDTO {

    private Integer notificationId;
    private Integer userId;
    private String userName;
    private String staffNumber;
    private Integer circulationId;
    private String type;
    private String message;
    private Boolean isSent;
    private LocalDateTime sentAt;

    public NotificationResponseDTO(Integer notificationId, Integer userId,
                                    String userName, String staffNumber,
                                    Integer circulationId, String type,
                                    String message, Boolean isSent,
                                    LocalDateTime sentAt) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.userName = userName;
        this.staffNumber = staffNumber;
        this.circulationId = circulationId;
        this.type = type;
        this.message = message;
        this.isSent = isSent;
        this.sentAt = sentAt;
    }

    // Getters
    public Integer getNotificationId() { return notificationId; }
    public Integer getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getStaffNumber() { return staffNumber; }
    public Integer getCirculationId() { return circulationId; }
    public String getType() { return type; }
    public String getMessage() { return message; }
    public Boolean getIsSent() { return isSent; }
    public LocalDateTime getSentAt() { return sentAt; }
}