package com.cdot.library_management.service;

import com.cdot.library_management.service.ReservationService;
import com.cdot.library_management.dto.CirculationRequestDTO;
import com.cdot.library_management.dto.CirculationResponseDTO;
import com.cdot.library_management.entity.*;
import com.cdot.library_management.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CirculationService {

    private final CirculationRepository circulationRepository;
    private final BookCopyRepository bookCopyRepository;
    private final UserRepository userRepository;
    private final FineRepository fineRepository;
    private final SystemConfigService systemConfigService;
    private final EmailService emailService;
    private final ReservationService reservationService;

    public CirculationService(CirculationRepository circulationRepository,
                           BookCopyRepository bookCopyRepository,
                            UserRepository userRepository,
                            FineRepository fineRepository,
                            SystemConfigService systemConfigService,
                            ReservationService reservationService,
                            @Autowired(required = false) EmailService emailService) {
        this.circulationRepository = circulationRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.userRepository = userRepository;
        this.fineRepository = fineRepository;
        this.systemConfigService = systemConfigService;
        this.reservationService = reservationService;
        this.emailService = emailService;
    }

    //issue book
    @Transactional
    public CirculationResponseDTO issueBook(CirculationRequestDTO request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        if (!user.getIsActive()) {
            throw new RuntimeException("User account is deactivated");
        }

        BookCopy copy = bookCopyRepository.findById(request.getCopyId())
                .orElseThrow(() -> new RuntimeException("Copy not found with id: " + request.getCopyId()));

        if (!copy.getStatus().equals("available")) {
            throw new RuntimeException("Copy is not available. Current status: " + copy.getStatus());
        }

        int maxBooks = systemConfigService.getMaxBooksPerUser();
        long currentlyIssued = circulationRepository
                .countByUser_UserIdAndStatus(request.getUserId(), "issued");

        if (currentlyIssued >= maxBooks) {
            throw new RuntimeException("User has reached maximum book limit of " + maxBooks);
        }

        String issuedByStaffNumber = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User issuedBy = userRepository.findByStaffNumber(issuedByStaffNumber)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));

        LocalDate issueDate = request.getIssueDate() != null
                ? request.getIssueDate() : LocalDate.now();

        LocalDate dueDate = request.getDueDate() != null
                ? request.getDueDate()
                : issueDate.plusDays(systemConfigService.getLoanPeriodDays());

        Circulation circulation = new Circulation();
        circulation.setBookCopy(copy);
        circulation.setUser(user);
        circulation.setIssuedBy(issuedBy);
        circulation.setIssueDate(issueDate);
        circulation.setDueDate(dueDate);
        circulation.setStatus("issued");

        Circulation savedCirculation = circulationRepository.save(circulation);

        copy.setStatus("issued");
        bookCopyRepository.save(copy);

    if (emailService != null){
        emailService.sendBookIssuedEmail(
                user.getEmail(),
                user.getName(),
                copy.getBook().getTitle(),
                copy.getAccessionNumber(),
                dueDate.toString()
        );
    }
        return mapToResponseDTO(savedCirculation);
    }

    //return book
    @Transactional
    public CirculationResponseDTO returnBook(Integer circulationId) {

        Circulation circulation = circulationRepository.findById(circulationId)
                .orElseThrow(() -> new RuntimeException("Circulation not found with id: " + circulationId));

        if (circulation.getStatus().equals("returned")) {
            throw new RuntimeException("Book already returned");
        }

        LocalDate returnDate = LocalDate.now();
        circulation.setReturnDate(returnDate);
        circulation.setStatus("returned");

        BookCopy copy = circulation.getBookCopy();
        copy.setStatus("available");
        bookCopyRepository.save(copy);

        reservationService.notifyReservedUsers(
            circulation.getBookCopy().getBook().getBookId()
        );

        if (returnDate.isAfter(circulation.getDueDate())) {
            if (systemConfigService.isFineSystemEnabled()) {
                long daysOverdue = returnDate.toEpochDay() - circulation.getDueDate().toEpochDay();
                double finePerDay = systemConfigService.getFinePerDay();
                double fineAmount = daysOverdue * finePerDay;

                Fine fine = new Fine();
                fine.setCirculation(circulation);
                fine.setAmount(BigDecimal.valueOf(fineAmount));
                fine.setStatus("pending");
                fineRepository.save(fine);

                if (emailService != null) {
                    emailService.sendFineEmail(
                        circulation.getUser().getEmail(),
                        circulation.getUser().getName(),
                        copy.getBook().getTitle(),
                        fineAmount
                    );
                }
            }
        }

        Circulation savedCirculation = circulationRepository.save(circulation);

        if (emailService != null){
            emailService.sendBookReturnedEmail(
                circulation.getUser().getEmail(),
                circulation.getUser().getName(),
                copy.getBook().getTitle(),
                returnDate.toString()
            );
        }
        return mapToResponseDTO(savedCirculation);
    }

    //get all circulation records
    public List<CirculationResponseDTO> getAllCirculations() {
        return circulationRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //get circulation by id
    public CirculationResponseDTO getCirculationById(Integer circulationId) {
        Circulation circulation = circulationRepository.findById(circulationId)
                .orElseThrow(() -> new RuntimeException("Circulation not found with id: " + circulationId));
        return mapToResponseDTO(circulation);
    }

    //get circulation history of a user
    public List<CirculationResponseDTO> getCirculationByUser(Integer userId) {
        return circulationRepository.findByUser_UserId(userId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //get all overdue records
    public List<CirculationResponseDTO> getOverdueCirculations() {
        return circulationRepository.findByDueDateBeforeAndStatus(LocalDate.now(), "issued")
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //get all issued records
    public List<CirculationResponseDTO> getIssuedCirculations() {
        return circulationRepository.findByStatus("issued")
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //map Circulation entity to CirculationResponseDTO
    private CirculationResponseDTO mapToResponseDTO(Circulation circulation) {
        return new CirculationResponseDTO(
                circulation.getCirculationId(),
                circulation.getBookCopy().getCopyId(),
                circulation.getBookCopy().getAccessionNumber(),
                circulation.getBookCopy().getBook().getBookId(),
                circulation.getBookCopy().getBook().getTitle(),
                circulation.getBookCopy().getBook().getCallNumber(),
                circulation.getUser().getUserId(),
                circulation.getUser().getName(),
                circulation.getUser().getStaffNumber(),
                circulation.getIssuedBy().getUserId(),
                circulation.getIssuedBy().getName(),
                circulation.getIssueDate(),
                circulation.getDueDate(),
                circulation.getReturnDate(),
                circulation.getStatus(),
                circulation.getCreatedAt()
        );
    }
}