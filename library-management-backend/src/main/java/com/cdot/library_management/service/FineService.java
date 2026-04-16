package com.cdot.library_management.service;

import com.cdot.library_management.dto.FineResponseDTO;
import com.cdot.library_management.entity.Fine;
import com.cdot.library_management.entity.User;
import com.cdot.library_management.repository.FineRepository;
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

    public FineService(FineRepository fineRepository,
                       UserRepository userRepository) {
        this.fineRepository = fineRepository;
        this.userRepository = userRepository;
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

        String staffNumber = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User collectedBy = userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));

        fine.setStatus("paid");
        fine.setPaidDate(LocalDate.now());
        fine.setCollectedBy(collectedBy);

        Fine savedFine = fineRepository.save(fine);
        return mapToResponseDTO(savedFine);
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

        String staffNumber = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User collectedBy = userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));

        fine.setStatus("waived");
        fine.setPaidDate(LocalDate.now());
        fine.setCollectedBy(collectedBy);

        Fine savedFine = fineRepository.save(fine);
        return mapToResponseDTO(savedFine);
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
                fine.getCollectedBy() != null ? fine.getCollectedBy().getUserId() : null,
                fine.getCollectedBy() != null ? fine.getCollectedBy().getName() : null,
                fine.getCreatedAt()
        );
    }
}