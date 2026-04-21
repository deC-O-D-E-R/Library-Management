package com.cdot.library_management.repository;

import com.cdot.library_management.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByUser_UserId(Integer userId);
    List<Reservation> findByBook_BookId(Integer bookId);
    List<Reservation> findByStatus(String status);
    List<Reservation> findByBook_BookIdAndStatus(Integer bookId, String status);
    Optional<Reservation> findByUser_UserIdAndBook_BookIdAndStatus(Integer userId, Integer bookId, String status);
    List<Reservation> findByBook_BookIdAndStatusIn(Integer bookId, List<String> statuses);
}