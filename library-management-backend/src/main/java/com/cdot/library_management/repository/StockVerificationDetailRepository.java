package com.cdot.library_management.repository;

import com.cdot.library_management.entity.StockVerificationDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockVerificationDetailRepository extends JpaRepository<StockVerificationDetail, Integer> {
    List<StockVerificationDetail> findByStockVerification_VerificationId(Integer verificationId);
    List<StockVerificationDetail> findByBookCopy_CopyId(Integer copyId);
    List<StockVerificationDetail> findByMarkedStatus(String markedStatus);
    List<StockVerificationDetail> findByStockVerification_VerificationIdAndMarkedStatus(Integer verificationId, String markedStatus);
}