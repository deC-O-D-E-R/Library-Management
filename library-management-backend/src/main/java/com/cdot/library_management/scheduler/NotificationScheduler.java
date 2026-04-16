package com.cdot.library_management.scheduler;

import com.cdot.library_management.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NotificationScheduler {

    private final NotificationService notificationService;

    public NotificationScheduler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Runs every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDueReminders() {
        int count = notificationService.sendDueReminders();
        System.out.println("Due reminders sent: " + count + " on " + java.time.LocalDate.now());
    }

    // Runs every day at 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void processOverdue() {
        int count = notificationService.processOverdue();
        System.out.println("Overdue processed: " + count + " on " + java.time.LocalDate.now());
    }
}