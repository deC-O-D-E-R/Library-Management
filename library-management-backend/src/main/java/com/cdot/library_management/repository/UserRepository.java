package com.cdot.library_management.repository;

import com.cdot.library_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByStaffNumber(String staffNumber);
    Optional<User> findByEmail(String email);
    List<User> findByIsActive(Boolean isActive);
    List<User> findByDateOfSuperannuationBeforeAndIsActive(LocalDate date, Boolean isActive);
}