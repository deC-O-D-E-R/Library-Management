package com.cdot.library_management.service;

import com.cdot.library_management.dto.FineResponseDTO;
import com.cdot.library_management.entity.Fine;
import com.cdot.library_management.entity.SystemAccount;
import com.cdot.library_management.entity.User;
import com.cdot.library_management.repository.FineRepository;
import com.cdot.library_management.repository.SystemAccountRepository;
import com.cdot.library_management.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FineService {

    private final FineRepository fineRepository;
    private final UserRepository userRepository;
    private final SystemAccountRepository systemAccountRepository;

    public FineService(FineRepository fineRepository,
                       UserRepository userRepository,
                       SystemAccountRepository systemAccountRepository) {
        this.fineRepository = fineRepository;
        this.userRepository = userRepository;
        this.systemAccountRepository = systemAccountRepository;
    }

    //get all fines
    public List<FineResponseDTO> getAllFines() {
        return fineRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //get fine by id
    public FineResponseDTO getFineById(Integer fineId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found with id: " + fineId));
        return mapToResponseDTO(fine);
    }

    //get all fines of a user
    public List<FineResponseDTO> getFinesByUser(Integer userId) {
        return fineRepository.findByCirculation_User_UserId(userId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //get all pending fines
    public List<FineResponseDTO> getPendingFines() {
        return fineRepository.findByStatus("pending")
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //mark fine as paid
    @Transactional
    public FineResponseDTO markAsPaid(Integer fineId) {

        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found with id: " + fineId));

        if (fine.getStatus().equals("paid")) {
            throw new RuntimeException("Fine is already paid");
        }
        if (fine.getStatus().equals("waived")) {
            throw new RuntimeException("Fine is already waived");
        }

        resolveAndSetCollector(fine);

        fine.setStatus("paid");
        fine.setPaidDate(LocalDate.now());

        return mapToResponseDTO(fineRepository.save(fine));
    }

    //mark fine as waived
    @Transactional
    public FineResponseDTO markAsWaived(Integer fineId) {

        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found with id: " + fineId));

        if (fine.getStatus().equals("paid")) {
            throw new RuntimeException("Fine is already paid");
        }
        if (fine.getStatus().equals("waived")) {
            throw new RuntimeException("Fine is already waived");
        }

        resolveAndSetCollector(fine);

        fine.setStatus("waived");
        fine.setPaidDate(LocalDate.now());

        return mapToResponseDTO(fineRepository.save(fine));
    }

    //resolve who is collecting
    private void resolveAndSetCollector(Fine fine) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        systemAccountRepository.findByUsername(username).ifPresentOrElse(
                fine::setCollectedBySystemAccount,
                () -> {
                    User collector = userRepository.findByStaffNumber(username)
                            .orElseThrow(() -> new RuntimeException("Logged in user not found"));
                    fine.setCollectedBy(collector);
                }
        );
    }

    // resolve collected by name
    private String resolveCollectedByName(Fine fine) {
        if (fine.getCollectedBySystemAccount() != null) {
            return fine.getCollectedBySystemAccount().getAccountName();
        } else if (fine.getCollectedBy() != null) {
            return fine.getCollectedBy().getName();
        }
        return null;
    }

    // resolve collected by id
    private Integer resolveCollectedById(Fine fine) {
        if (fine.getCollectedBySystemAccount() != null) {
            return fine.getCollectedBySystemAccount().getAccountId();
        } else if (fine.getCollectedBy() != null) {
            return fine.getCollectedBy().getUserId();
        }
        return null;
    }

    //map Fine entity to FineResponseDTO
    private FineResponseDTO mapToResponseDTO(Fine fine) {
        return new FineResponseDTO(
                fine.getFineId(),
                fine.getCirculation().getCirculationId(),
                fine.getCirculation().getUser().getUserId(),
                fine.getCirculation().getUser().getName(),
                fine.getCirculation().getUser().getStaffNumber(),
                fine.getCirculation().getBookCopy().getBook().getTitle(),
                fine.getCirculation().getBookCopy().getAccessionNumber(),
                fine.getCirculation().getIssueDate(),
                fine.getCirculation().getDueDate(),
                fine.getCirculation().getReturnDate(),
                fine.getAmount(),
                fine.getStatus(),
                fine.getPaidDate(),
                resolveCollectedById(fine),
                resolveCollectedByName(fine),
                fine.getCreatedAt()
        );
    }
}