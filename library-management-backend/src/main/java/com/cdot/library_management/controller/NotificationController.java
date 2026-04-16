package com.cdot.library_management.controller;

import com.cdot.library_management.service.NotificationService;
import com.cdot.library_management.dto.NotificationResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/trigger-reminders")
    public ResponseEntity<?> triggerReminders() {
        try {
            int count = notificationService.sendDueReminders();
            return ResponseEntity.ok("Due reminders sent: " + count);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/trigger-overdue")
    public ResponseEntity<?> triggerOverdue() {
        try {
            int count = notificationService.processOverdue();
            return ResponseEntity.ok("Overdue processed: " + count);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsByUser(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userId));
    }

}