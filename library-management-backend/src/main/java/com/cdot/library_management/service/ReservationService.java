package com.cdot.library_management.service;

import com.cdot.library_management.dto.ReservationResponseDTO;
import com.cdot.library_management.entity.Book;
import com.cdot.library_management.entity.Reservation;
import com.cdot.library_management.entity.User;
import com.cdot.library_management.repository.BookCopyRepository;
import com.cdot.library_management.repository.BookRepository;
import com.cdot.library_management.repository.ReservationRepository;
import com.cdot.library_management.repository.UserRepository;
import com.cdot.library_management.repository.CirculationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final CirculationRepository circulationRepository;

    public ReservationService(ReservationRepository reservationRepository,
                               BookRepository bookRepository,
                               BookCopyRepository bookCopyRepository,
                               UserRepository userRepository,
                               CirculationRepository circulationRepository,
                               @Autowired(required = false) EmailService emailService) {
        this.reservationRepository = reservationRepository;
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.userRepository = userRepository;
        this.circulationRepository = circulationRepository;
        this.emailService = emailService;
    }

    //employee reserve a book
    @Transactional
    public ReservationResponseDTO reserveBook(Integer bookId) {

        String staffNumber = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        long availableCopies = bookCopyRepository
                .countByBook_BookIdAndStatus(bookId, "available");
        if (availableCopies > 0) {
            throw new RuntimeException("This book has available copies. Please borrow it directly from the librarian.");
        }

        reservationRepository.findByUser_UserIdAndBook_BookIdAndStatus(
                user.getUserId(), bookId, "pending")
                .ifPresent(r -> { throw new RuntimeException("You already have a pending reservation for this book."); });

        Reservation reservation = new Reservation();
        reservation.setBook(book);
        reservation.setUser(user);
        reservation.setStatus("pending");

        Reservation saved = reservationRepository.save(reservation);
        if (emailService != null) {
        circulationRepository.findActiveByBookId(bookId)
                .forEach(c -> emailService.sendReturnReminderEmail(
                c.getUser().getEmail(),
                c.getUser().getName(),
                book.getTitle()
                ));
        }

        return mapToResponseDTO(saved);
    }

    //employee cancel a reservation
    @Transactional
    public void cancelReservation(Integer reservationId) {

        String staffNumber = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        if (!reservation.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You can only cancel your own reservations");
        }

        if (reservation.getStatus().equals("fulfilled")) {
            throw new RuntimeException("Cannot cancel a fulfilled reservation");
        }

        reservation.setStatus("cancelled");
        reservationRepository.save(reservation);
    }

    //emplyee get all reservation
    public List<ReservationResponseDTO> getMyReservations() {

        String staffNumber = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reservationRepository.findByUser_UserId(user.getUserId())
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //libararian get all the pending reservation
    public List<ReservationResponseDTO> getAllPendingReservations() {
        return reservationRepository.findByStatus("pending")
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //libararian get all reservations
    public List<ReservationResponseDTO> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    //notify user when a look they reserved is available
    @Transactional
    public void notifyReservedUsers(Integer bookId) {

        List<Reservation> pending = reservationRepository
                .findByBook_BookIdAndStatus(bookId, "pending");

        if (pending.isEmpty()) return;

        Reservation first = pending.get(0);
        first.setStatus("notified");
        first.setNotifiedAt(LocalDateTime.now());
        reservationRepository.save(first);

        if (emailService != null) {
            emailService.sendReservationAvailableEmail(
                    first.getUser().getEmail(),
                    first.getUser().getName(),
                    first.getBook().getTitle()
            );
        }
    }

    //pending resevation -> fulfilled
    @Transactional
    public ReservationResponseDTO fulfillReservation(Integer reservationId) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        if (!reservation.getStatus().equals("notified") &&
            !reservation.getStatus().equals("pending")) {
            throw new RuntimeException("Only pending or notified reservations can be fulfilled");
        }

        reservation.setStatus("fulfilled");
        Reservation saved = reservationRepository.save(reservation);
        return mapToResponseDTO(saved);
    }

    //map response to dto
    private ReservationResponseDTO mapToResponseDTO(Reservation reservation) {
        return new ReservationResponseDTO(
                reservation.getReservationId(),
                reservation.getBook().getBookId(),
                reservation.getBook().getTitle(),
                reservation.getBook().getCallNumber(),
                reservation.getBook().getIsbn(),
                reservation.getUser().getUserId(),
                reservation.getUser().getName(),
                reservation.getUser().getStaffNumber(),
                reservation.getStatus(),
                reservation.getReservedAt(),
                reservation.getNotifiedAt()
        );
    }
}