package com.cdot.library_management.repository;

import com.cdot.library_management.entity.StockVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockVerificationRepository extends JpaRepository<StockVerification, Integer> {
    List<StockVerification> findByStatus(String status);
    List<StockVerification> findByScopeType(String scopeType);
    List<StockVerification> findByInitiatedBy_UserId(Integer userId);
    List<StockVerification> findByScopeTypeAndScopeValue(String scopeType, String scopeValue);
}