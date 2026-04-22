package com.cdot.library_management.repository;

import com.cdot.library_management.entity.VerificationAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationAssignmentRepository extends JpaRepository<VerificationAssignment, Integer> {
    List<VerificationAssignment> findByStockVerification_VerificationId(Integer verificationId);
}