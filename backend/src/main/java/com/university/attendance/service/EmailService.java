package com.university.attendance.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final String mailUsername;
    private final String mailFrom;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String mailUsername,
            @Value("${app.mail.from}") String mailFrom
    ) {
        this.mailSender = mailSender;
        this.mailUsername = mailUsername;
        this.mailFrom = mailFrom;
    }

    public boolean sendOtp(String to, String otp) {
        if (mailUsername == null || mailUsername.isBlank()) {
            return false;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom == null || mailFrom.isBlank() ? mailUsername : mailFrom);
        message.setTo(to);
        message.setSubject("University Attendance OTP");
        message.setText("Your OTP is: " + otp + "\n\nThis OTP is valid for 10 minutes.");
        mailSender.send(message);
        return true;
    }
}
