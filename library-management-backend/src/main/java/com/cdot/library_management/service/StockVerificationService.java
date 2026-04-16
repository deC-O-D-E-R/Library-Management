package com.cdot.library_management.service;

import com.cdot.library_management.dto.ScanRequestDTO;
import com.cdot.library_management.dto.StockVerificationRequestDTO;
import com.cdot.library_management.dto.StockVerificationResponseDTO;
import com.cdot.library_management.entity.*;
import com.cdot.library_management.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockVerificationService {

    private final StockVerificationRepository stockVerificationRepository;
    private final StockVerificationDetailRepository stockVerificationDetailRepository;
    private final BookCopyRepository bookCopyRepository;
    private final UserRepository userRepository;

    public StockVerificationService(StockVerificationRepository stockVerificationRepository,
                                     StockVerificationDetailRepository stockVerificationDetailRepository,
                                     BookCopyRepository bookCopyRepository,
                                     UserRepository userRepository) {
        this.stockVerificationRepository = stockVerificationRepository;
        this.stockVerificationDetailRepository = stockVerificationDetailRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.userRepository = userRepository;
    }

    //initiate verification
    @Transactional
    public StockVerificationResponseDTO initiateVerification(StockVerificationRequestDTO request) {

        String staffNumber = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User initiatedBy = userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));

        if (request.getScopeType() == null || request.getScopeType().isBlank()) {
            throw new RuntimeException("Scope type is required: full, category or call_number");
        }

        if (!request.getScopeType().equals("full") &&
            (request.getScopeValue() == null || request.getScopeValue().isBlank())) {
            throw new RuntimeException("Scope value is required for scope type: " + request.getScopeType());
        }

        StockVerification verification = new StockVerification();
        verification.setInitiatedBy(initiatedBy);
        verification.setScopeType(request.getScopeType());
        verification.setScopeValue(request.getScopeValue());
        verification.setStatus("in_progress");

        StockVerification saved = stockVerificationRepository.save(verification);
        return mapToResponseDTO(saved);
    }

    //scan a copy
    @Transactional
    public StockVerificationResponseDTO scanCopy(Integer verificationId,
                                                  ScanRequestDTO request) {

        StockVerification verification = stockVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Verification not found with id: " + verificationId));

        if (verification.getStatus().equals("completed")) {
            throw new RuntimeException("Verification is already completed");
        }

        if (!List.of("available", "issued", "missing", "damaged")
                .contains(request.getMarkedStatus())) {
            throw new RuntimeException("Invalid status: " + request.getMarkedStatus());
        }

        BookCopy copy = bookCopyRepository.findByAccessionNumber(request.getAccessionNumber())
                .orElseThrow(() -> new RuntimeException("Copy not found with accession number: "
                        + request.getAccessionNumber()));

        String previousStatus = copy.getStatus();

        copy.setStatus(request.getMarkedStatus());
        bookCopyRepository.save(copy);

        StockVerificationDetail detail = new StockVerificationDetail();
        detail.setStockVerification(verification);
        detail.setBookCopy(copy);
        detail.setPreviousStatus(previousStatus);
        detail.setMarkedStatus(request.getMarkedStatus());
        stockVerificationDetailRepository.save(detail);

        return mapToResponseDTO(verification);
    }

    //complete verification
    @Transactional
    public StockVerificationResponseDTO completeVerification(Integer verificationId) {

        StockVerification verification = stockVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Verification not found with id: " + verificationId));

        if (verification.getStatus().equals("completed")) {
            throw new RuntimeException("Verification is already completed");
        }

        verification.setStatus("completed");
        verification.setCompletedAt(LocalDateTime.now());

        StockVerification saved = stockVerificationRepository.save(verification);
        return mapToResponseDTO(saved);
    }

    //get all verifications
    public List<StockVerificationResponseDTO> getAllVerifications() {
        return stockVerificationRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //get verification by ID
    public StockVerificationResponseDTO getVerificationById(Integer verificationId) {
        StockVerification verification = stockVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Verification not found with id: " + verificationId));
        return mapToResponseDTO(verification);
    }

    //get discrepancy report (only copies where status changed)
    public StockVerificationResponseDTO getDiscrepancyReport(Integer verificationId) {

        StockVerification verification = stockVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Verification not found with id: " + verificationId));

        List<StockVerificationDetail> allDetails = stockVerificationDetailRepository
                .findByStockVerification_VerificationId(verificationId);

        List<StockVerificationDetail> discrepancies = allDetails.stream()
                .filter(d -> !d.getPreviousStatus().equals(d.getMarkedStatus()))
                .collect(Collectors.toList());

        List<StockVerificationResponseDTO.ScanDetailDTO> detailDTOs = discrepancies.stream()
                .map(d -> new StockVerificationResponseDTO.ScanDetailDTO(
                        d.getDetailId(),
                        d.getBookCopy().getCopyId(),
                        d.getBookCopy().getAccessionNumber(),
                        d.getBookCopy().getBook().getTitle(),
                        d.getBookCopy().getBook().getCallNumber(),
                        d.getPreviousStatus(),
                        d.getMarkedStatus(),
                        true,
                        d.getVerifiedAt()
                ))
                .collect(Collectors.toList());

        int availableCount = (int) discrepancies.stream()
                .filter(d -> d.getMarkedStatus().equals("available")).count();
        int issuedCount = (int) discrepancies.stream()
                .filter(d -> d.getMarkedStatus().equals("issued")).count();
        int missingCount = (int) discrepancies.stream()
                .filter(d -> d.getMarkedStatus().equals("missing")).count();
        int damagedCount = (int) discrepancies.stream()
                .filter(d -> d.getMarkedStatus().equals("damaged")).count();

        return new StockVerificationResponseDTO(
                verification.getVerificationId(),
                verification.getInitiatedBy().getUserId(),
                verification.getInitiatedBy().getName(),
                verification.getScopeType(),
                verification.getScopeValue(),
                verification.getStatus(),
                verification.getStartedAt(),
                verification.getCompletedAt(),
                discrepancies.size(),
                availableCount,
                issuedCount,
                missingCount,
                damagedCount,
                detailDTOs
        );
    }

    //map StockVerification entity to DTO
    private StockVerificationResponseDTO mapToResponseDTO(StockVerification verification) {

        List<StockVerificationDetail> details = stockVerificationDetailRepository
                .findByStockVerification_VerificationId(verification.getVerificationId());

        List<StockVerificationResponseDTO.ScanDetailDTO> detailDTOs = details.stream()
                .map(d -> new StockVerificationResponseDTO.ScanDetailDTO(
                        d.getDetailId(),
                        d.getBookCopy().getCopyId(),
                        d.getBookCopy().getAccessionNumber(),
                        d.getBookCopy().getBook().getTitle(),
                        d.getBookCopy().getBook().getCallNumber(),
                        d.getPreviousStatus(),
                        d.getMarkedStatus(),
                        !d.getPreviousStatus().equals(d.getMarkedStatus()),
                        d.getVerifiedAt()
                ))
                .collect(Collectors.toList());

        int availableCount = (int) details.stream()
                .filter(d -> d.getMarkedStatus().equals("available")).count();
        int issuedCount = (int) details.stream()
                .filter(d -> d.getMarkedStatus().equals("issued")).count();
        int missingCount = (int) details.stream()
                .filter(d -> d.getMarkedStatus().equals("missing")).count();
        int damagedCount = (int) details.stream()
                .filter(d -> d.getMarkedStatus().equals("damaged")).count();

        return new StockVerificationResponseDTO(
                verification.getVerificationId(),
                verification.getInitiatedBy().getUserId(),
                verification.getInitiatedBy().getName(),
                verification.getScopeType(),
                verification.getScopeValue(),
                verification.getStatus(),
                verification.getStartedAt(),
                verification.getCompletedAt(),
                details.size(),
                availableCount,
                issuedCount,
                missingCount,
                damagedCount,
                detailDTOs
        );
    }
}