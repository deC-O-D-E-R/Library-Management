package com.cdot.library_management.repository;

import com.cdot.library_management.entity.Circulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CirculationRepository extends JpaRepository<Circulation, Integer> {
    List<Circulation> findByUser_UserId(Integer userId);
    List<Circulation> findByStatus(String status);
    List<Circulation> findByUser_UserIdAndStatus(Integer userId, String status);
    List<Circulation> findByDueDateBeforeAndStatus(LocalDate date, String status);
    Optional<Circulation> findByBookCopy_CopyIdAndStatus(Integer copyId, String status);
    long countByUser_UserIdAndStatus(Integer userId, String status);

    @Query("SELECT c FROM Circulation c WHERE c.bookCopy.book.bookId = :bookId AND c.status = 'issued'")
    List<Circulation> findActiveByBookId(@Param("bookId") Integer bookId);
}