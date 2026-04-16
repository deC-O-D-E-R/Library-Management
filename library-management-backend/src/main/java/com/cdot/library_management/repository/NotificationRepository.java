package com.cdot.library_management.repository;

import com.cdot.library_management.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUser_UserId(Integer userId);
    List<Notification> findByIsSent(Boolean isSent);
    List<Notification> findByType(String type);
    List<Notification> findByCirculation_CirculationId(Integer circulationId);
    List<Notification> findByUser_UserIdAndIsSent(Integer userId, Boolean isSent);
}