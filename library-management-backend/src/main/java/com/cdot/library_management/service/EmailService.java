package com.cdot.library_management.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendBookIssuedEmail(String toEmail, String userName,
                                    String bookTitle, String accessionNumber,
                                    String dueDate) {
        String subject = "Book Issued - CDOT Library";
        String body = "Dear " + userName + ",\n\n"
                + "The following book has been issued to you:\n"
                + "Title: " + bookTitle + "\n"
                + "Accession No: " + accessionNumber + "\n"
                + "Due Date: " + dueDate + "\n\n"
                + "Please return the book before the due date to avoid fines.\n\n"
                + "Regards,\nCDOT Library";
        sendEmail(toEmail, subject, body);
    }

    public void sendBookReturnedEmail(String toEmail, String userName,
                                      String bookTitle, String returnDate) {
        String subject = "Book Returned - CDOT Library";
        String body = "Dear " + userName + ",\n\n"
                + "The following book has been returned successfully:\n"
                + "Title: " + bookTitle + "\n"
                + "Return Date: " + returnDate + "\n\n"
                + "Thank you!\n\n"
                + "Regards,\nCDOT Library";
        sendEmail(toEmail, subject, body);
    }

    public void sendDueReminderEmail(String toEmail, String userName,
                                     String bookTitle, String dueDate) {
        String subject = "Due Date Reminder - CDOT Library";
        String body = "Dear " + userName + ",\n\n"
                + "This is a reminder that the following book is due tomorrow:\n"
                + "Title: " + bookTitle + "\n"
                + "Due Date: " + dueDate + "\n\n"
                + "Please return the book on time to avoid fines.\n\n"
                + "Regards,\nCDOT Library";
        sendEmail(toEmail, subject, body);
    }

    public void sendOverdueEmail(String toEmail, String userName,
                                  String bookTitle, String dueDate,
                                  long daysOverdue, double fineAmount) {
        String subject = "Overdue Notice - CDOT Library";
        String body = "Dear " + userName + ",\n\n"
                + "The following book is overdue:\n"
                + "Title: " + bookTitle + "\n"
                + "Due Date: " + dueDate + "\n"
                + "Days Overdue: " + daysOverdue + "\n"
                + "Fine Amount: Rs. " + fineAmount + "\n\n"
                + "Please return the book immediately.\n\n"
                + "Regards,\nCDOT Library";
        sendEmail(toEmail, subject, body);
    }

    public void sendFineEmail(String toEmail, String userName,
                               String bookTitle, double fineAmount) {
        String subject = "Fine Notice - CDOT Library";
        String body = "Dear " + userName + ",\n\n"
                + "A fine has been charged for the following book:\n"
                + "Title: " + bookTitle + "\n"
                + "Fine Amount: Rs. " + fineAmount + "\n\n"
                + "Please pay the fine at the library counter.\n\n"
                + "Regards,\nCDOT Library";
        sendEmail(toEmail, subject, body);
    }

    public void sendReservationAvailableEmail(String toEmail, String userName, String bookTitle) {
        String subject = "Book Available - CDOT Library";
        String body = "Dear " + userName + ",\n\n"
                + "Good news! The book you reserved is now available:\n"
                + "Title: " + bookTitle + "\n\n"
                + "Please visit the library to borrow it at the earliest.\n\n"
                + "Regards,\nCDOT Library";
        sendEmail(toEmail, subject, body);
    }

    public void sendReturnReminderEmail(String toEmail, String userName, String bookTitle) {
        String subject = "Return Request - CDOT Library";
        String body = "Dear " + userName + ",\n\n"
                + "We would like to inform you that another member has placed a reservation for the following book:\n"
                + "Title: " + bookTitle + "\n\n"
                + "We kindly request you to return the book at your earliest convenience.\n\n"
                + "Regards,\nCDOT Library";
        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("cdot.interns@cdot.in");
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }
}