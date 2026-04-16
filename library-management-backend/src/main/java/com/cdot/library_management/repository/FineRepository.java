package com.cdot.library_management.repository;

import com.cdot.library_management.entity.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FineRepository extends JpaRepository<Fine, Integer> {
    Optional<Fine> findByCirculation_CirculationId(Integer circulationId);
    List<Fine> findByStatus(String status);
    List<Fine> findByCirculation_User_UserId(Integer userId);
    List<Fine> findByCirculation_User_UserIdAndStatus(Integer userId, String status);
}