package com.cdot.library_management.service;

import com.cdot.library_management.entity.Circulation;
import com.cdot.library_management.entity.Notification;
import com.cdot.library_management.repository.CirculationRepository;
import com.cdot.library_management.repository.NotificationRepository;
import com.cdot.library_management.dto.NotificationResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final CirculationRepository circulationRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final SystemConfigService systemConfigService;

    public NotificationService(CirculationRepository circulationRepository,
                                NotificationRepository notificationRepository,
                                SystemConfigService systemConfigService,
                                @Autowired(required = false) EmailService emailService) {
        this.circulationRepository = circulationRepository;
        this.notificationRepository = notificationRepository;
        this.systemConfigService = systemConfigService;
        this.emailService = emailService;
    }

    //send due reminders (1 day before due date)
    @Transactional
    public int sendDueReminders() {

        LocalDate tomorrow = LocalDate.now().plusDays(1);

        List<Circulation> dueTomorrow = circulationRepository
                .findByDueDateBeforeAndStatus(tomorrow.plusDays(1), "issued")
                .stream()
                .filter(c -> c.getDueDate().equals(tomorrow))
                .toList();

        int count = 0;

        for (Circulation circulation : dueTomorrow) {

            Notification notification = new Notification();
            notification.setUser(circulation.getUser());
            notification.setCirculation(circulation);
            notification.setType("due_reminder");
            notification.setMessage("Your book '" + circulation.getBookCopy().getBook().getTitle()
                    + "' is due tomorrow on " + circulation.getDueDate());
            notification.setIsSent(false);

            if (emailService != null) {
                emailService.sendDueReminderEmail(
                        circulation.getUser().getEmail(),
                        circulation.getUser().getName(),
                        circulation.getBookCopy().getBook().getTitle(),
                        circulation.getDueDate().toString()
                );
                notification.setIsSent(true);
                notification.setSentAt(LocalDateTime.now());
            }

            notificationRepository.save(notification);
            count++;
        }

        return count;
    }

    //mark overdue circulations and send overdue alerts
    @Transactional
    public int processOverdue() {

        List<Circulation> overdueCirculations = circulationRepository
                .findByDueDateBeforeAndStatus(LocalDate.now(), "issued");

        int count = 0;

        for (Circulation circulation : overdueCirculations) {

            circulation.setStatus("overdue");
            circulationRepository.save(circulation);

            long daysOverdue = LocalDate.now().toEpochDay()
                    - circulation.getDueDate().toEpochDay();

            double finePerDay = systemConfigService.getFinePerDay();
            double estimatedFine = daysOverdue * finePerDay;

            Notification notification = new Notification();
            notification.setUser(circulation.getUser());
            notification.setCirculation(circulation);
            notification.setType("overdue");
            notification.setMessage("Your book '" + circulation.getBookCopy().getBook().getTitle()
                    + "' is overdue by " + daysOverdue + " days. Estimated fine: Rs. " + estimatedFine);
            notification.setIsSent(false);

            if (emailService != null) {
                emailService.sendOverdueEmail(
                        circulation.getUser().getEmail(),
                        circulation.getUser().getName(),
                        circulation.getBookCopy().getBook().getTitle(),
                        circulation.getDueDate().toString(),
                        daysOverdue,
                        estimatedFine
                );
                notification.setIsSent(true);
                notification.setSentAt(LocalDateTime.now());
            }

            notificationRepository.save(notification);
            count++;
        }

        return count;
    }

    //get all notifications
    public List<NotificationResponseDTO> getAllNotifications() {
        return notificationRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //get notifications by user
    public List<NotificationResponseDTO> getNotificationsByUser(Integer userId) {
        return notificationRepository.findByUser_UserId(userId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //map Notification entity to NotificationResponseDTO
    private NotificationResponseDTO mapToResponseDTO(Notification notification) {
        return new NotificationResponseDTO(
                notification.getNotificationId(),
                notification.getUser().getUserId(),
                notification.getUser().getName(),
                notification.getUser().getStaffNumber(),
                notification.getCirculation() != null
                        ? notification.getCirculation().getCirculationId() : null,
                notification.getType(),
                notification.getMessage(),
                notification.getIsSent(),
                notification.getSentAt()
        );
    }

}