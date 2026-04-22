package com.cdot.library_management.service;

import com.cdot.library_management.dto.ScanRequestDTO;
import com.cdot.library_management.dto.StockVerificationRequestDTO;
import com.cdot.library_management.dto.StockVerificationResponseDTO;
import com.cdot.library_management.repository.VerificationAssignmentRepository;
import com.cdot.library_management.dto.PrintSheetDTO;
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
    private final VerificationAssignmentRepository verificationAssignmentRepository;
    private final BookCopyRepository bookCopyRepository;
    private final UserRepository userRepository;

    public StockVerificationService(StockVerificationRepository stockVerificationRepository,
                                     StockVerificationDetailRepository stockVerificationDetailRepository,
                                     VerificationAssignmentRepository verificationAssignmentRepository,
                                     BookCopyRepository bookCopyRepository,
                                     UserRepository userRepository) {
        this.stockVerificationRepository = stockVerificationRepository;
        this.stockVerificationDetailRepository = stockVerificationDetailRepository;
        this.verificationAssignmentRepository = verificationAssignmentRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.userRepository = userRepository;
    }

    //initiate a verification
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

        if (request.getAssignments() == null || request.getAssignments().isEmpty()) {
            throw new RuntimeException("At least one verifier assignment is required");
        }

        StockVerification verification = new StockVerification();
        verification.setInitiatedBy(initiatedBy);
        verification.setScopeType(request.getScopeType());
        verification.setScopeValue(request.getScopeValue());
        verification.setStatus("in_progress");

        StockVerification saved = stockVerificationRepository.save(verification);

        for (StockVerificationRequestDTO.AssignmentRequestDTO a : request.getAssignments()) {
            User verifier = userRepository.findById(a.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + a.getUserId()));

            VerificationAssignment assignment = new VerificationAssignment();
            assignment.setStockVerification(saved);
            assignment.setUser(verifier);
            assignment.setName(verifier.getName());
            assignment.setEmpId(verifier.getStaffNumber());
            assignment.setDesignation(verifier.getDesignation());
            assignment.setScopeType(a.getScopeType());
            assignment.setScopeFrom(a.getScopeFrom());
            assignment.setScopeTo(a.getScopeTo());
            verificationAssignmentRepository.save(assignment);
        }

        return mapToResponseDTO(saved);
    }

    //get the assigned verifiers
    public List<StockVerificationResponseDTO.AssignmentDTO> getAssignments(Integer verificationId) {

        stockVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Verification not found with id: " + verificationId));

        List<StockVerificationDetail> details = stockVerificationDetailRepository
                .findByStockVerification_VerificationId(verificationId);

        return buildAssignmentDTOs(verificationId, details);
        }

        public PrintSheetDTO getPrintSheetData(Integer verificationId, Integer assignmentId) {

        StockVerification verification = stockVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Verification not found with id: " + verificationId));

        VerificationAssignment assignment = verificationAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + assignmentId));

        List<BookCopy> copies = bookCopyRepository.findAll()
                .stream()
                .filter(c -> matchesAssignmentScope(c, assignment))
                .collect(Collectors.toList());

        List<PrintSheetDTO.PrintSheetRow> rows = copies.stream()
                .map(c -> new PrintSheetDTO.PrintSheetRow(
                        c.getAccessionNumber(),
                        c.getBook().getTitle(),
                        c.getBook().getCallNumber(),
                        c.getStatus()
                ))
                .collect(Collectors.toList());

        return new PrintSheetDTO(
                verification.getVerificationId(),
                assignment.getAssignmentId(),
                assignment.getName(),
                assignment.getEmpId(),
                assignment.getDesignation(),
                assignment.getScopeType(),
                assignment.getScopeFrom(),
                assignment.getScopeTo(),
                verification.getStartedAt(),
                rows
        );
        }

        //check if the copy lies in the verifier's call no range
        private boolean matchesAssignmentScope(BookCopy copy, VerificationAssignment assignment) {
        String callNumber = copy.getBook().getCallNumber();
        if (callNumber == null) return false;

        if ("category".equals(assignment.getScopeType())) {
                String category = copy.getBook().getCategory() != null
                        ? copy.getBook().getCategory().getName()
                        : null;
                return assignment.getScopeFrom() != null
                        && assignment.getScopeFrom().equalsIgnoreCase(category);
        }

        if ("call_number_range".equals(assignment.getScopeType())) {
                String from = assignment.getScopeFrom();
                String to = assignment.getScopeTo();
                if (from == null || to == null) return false;
                return callNumber.compareToIgnoreCase(from) >= 0
                        && callNumber.compareToIgnoreCase(to) <= 0;
        }

        return true;
        }

    //scan a copy
    @Transactional
    public StockVerificationResponseDTO scanCopy(Integer verificationId, ScanRequestDTO request) {

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

        VerificationAssignment assignment = null;
        if (request.getAssignmentId() != null) {
            assignment = verificationAssignmentRepository.findById(request.getAssignmentId())
                    .orElseThrow(() -> new RuntimeException("Assignment not found with id: "
                            + request.getAssignmentId()));
        }

        String previousStatus = copy.getStatus();
        copy.setStatus(request.getMarkedStatus());
        bookCopyRepository.save(copy);

        StockVerificationDetail detail = new StockVerificationDetail();
        detail.setStockVerification(verification);
        detail.setBookCopy(copy);
        detail.setAssignment(assignment);
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

    //get all the verifications
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

    //get discrepency report
    public StockVerificationResponseDTO getDiscrepancyReport(Integer verificationId) {

        StockVerification verification = stockVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Verification not found with id: " + verificationId));

        List<StockVerificationDetail> allDetails = stockVerificationDetailRepository
                .findByStockVerification_VerificationId(verificationId);

        // Cross-verifier reconciliation:
        // If a copy was marked missing by one verifier but found (available/issued)
        // by another, it is misplaced — not truly missing
        List<Integer> foundCopyIds = allDetails.stream()
                .filter(d -> d.getMarkedStatus().equals("available")
                          || d.getMarkedStatus().equals("issued"))
                .map(d -> d.getBookCopy().getCopyId())
                .collect(Collectors.toList());

        List<StockVerificationDetail> discrepancies = allDetails.stream()
                .filter(d -> !d.getPreviousStatus().equals(d.getMarkedStatus()))
                .collect(Collectors.toList());

        List<StockVerificationResponseDTO.ScanDetailDTO> detailDTOs = discrepancies.stream()
                .map(d -> {
                    boolean isMisplaced = d.getMarkedStatus().equals("missing")
                            && foundCopyIds.contains(d.getBookCopy().getCopyId());
                    String resolvedStatus = isMisplaced ? "misplaced" : d.getMarkedStatus();
                    String verifierName = d.getAssignment() != null
                            ? d.getAssignment().getName() : null;
                    Integer assignmentId = d.getAssignment() != null
                            ? d.getAssignment().getAssignmentId() : null;
                    return new StockVerificationResponseDTO.ScanDetailDTO(
                            d.getDetailId(),
                            d.getBookCopy().getCopyId(),
                            d.getBookCopy().getAccessionNumber(),
                            d.getBookCopy().getBook().getTitle(),
                            d.getBookCopy().getBook().getCallNumber(),
                            d.getPreviousStatus(),
                            resolvedStatus,
                            true,
                            d.getVerifiedAt(),
                            assignmentId,
                            verifierName
                    );
                })
                .collect(Collectors.toList());

        int availableCount = (int) discrepancies.stream()
                .filter(d -> d.getMarkedStatus().equals("available")).count();
        int issuedCount = (int) discrepancies.stream()
                .filter(d -> d.getMarkedStatus().equals("issued")).count();
        int missingCount = (int) discrepancies.stream()
                .filter(d -> d.getMarkedStatus().equals("missing")
                          && !foundCopyIds.contains(d.getBookCopy().getCopyId())).count();
        int damagedCount = (int) discrepancies.stream()
                .filter(d -> d.getMarkedStatus().equals("damaged")).count();

        List<StockVerificationResponseDTO.AssignmentDTO> assignmentDTOs =
                buildAssignmentDTOs(verificationId, allDetails);

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
                assignmentDTOs,
                detailDTOs
        );
    }

    //map response to responseDTO
    private StockVerificationResponseDTO mapToResponseDTO(StockVerification verification) {

        List<StockVerificationDetail> details = stockVerificationDetailRepository
                .findByStockVerification_VerificationId(verification.getVerificationId());

        List<StockVerificationResponseDTO.ScanDetailDTO> detailDTOs = details.stream()
                .map(d -> {
                    String verifierName = d.getAssignment() != null
                            ? d.getAssignment().getName() : null;
                    Integer assignmentId = d.getAssignment() != null
                            ? d.getAssignment().getAssignmentId() : null;
                    return new StockVerificationResponseDTO.ScanDetailDTO(
                            d.getDetailId(),
                            d.getBookCopy().getCopyId(),
                            d.getBookCopy().getAccessionNumber(),
                            d.getBookCopy().getBook().getTitle(),
                            d.getBookCopy().getBook().getCallNumber(),
                            d.getPreviousStatus(),
                            d.getMarkedStatus(),
                            !d.getPreviousStatus().equals(d.getMarkedStatus()),
                            d.getVerifiedAt(),
                            assignmentId,
                            verifierName
                    );
                })
                .collect(Collectors.toList());

        int availableCount = (int) details.stream()
                .filter(d -> d.getMarkedStatus().equals("available")).count();
        int issuedCount = (int) details.stream()
                .filter(d -> d.getMarkedStatus().equals("issued")).count();
        int missingCount = (int) details.stream()
                .filter(d -> d.getMarkedStatus().equals("missing")).count();
        int damagedCount = (int) details.stream()
                .filter(d -> d.getMarkedStatus().equals("damaged")).count();

        List<StockVerificationResponseDTO.AssignmentDTO> assignmentDTOs =
                buildAssignmentDTOs(verification.getVerificationId(), details);

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
                assignmentDTOs,
                detailDTOs
        );
    }

    //build assigned DTO
    private List<StockVerificationResponseDTO.AssignmentDTO> buildAssignmentDTOs(
            Integer verificationId, List<StockVerificationDetail> details) {

        return verificationAssignmentRepository
                .findByStockVerification_VerificationId(verificationId)
                .stream()
                .map(a -> {
                    int scannedCount = (int) details.stream()
                            .filter(d -> d.getAssignment() != null
                                    && d.getAssignment().getAssignmentId()
                                            .equals(a.getAssignmentId()))
                            .count();
                    return new StockVerificationResponseDTO.AssignmentDTO(
                            a.getAssignmentId(),
                            a.getUser().getUserId(),
                            a.getName(),
                            a.getEmpId(),
                            a.getDesignation(),
                            a.getScopeType(),
                            a.getScopeFrom(),
                            a.getScopeTo(),
                            scannedCount
                    );
                })
                .collect(Collectors.toList());
    }
}