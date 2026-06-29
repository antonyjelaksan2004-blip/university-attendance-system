package com.university.attendance.service;

import com.university.attendance.dto.ForgotPasswordRequest;
import com.university.attendance.dto.OtpVerifyRequest;
import com.university.attendance.dto.ResetPasswordRequest;
import com.university.attendance.model.User;
import com.university.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();

    public PasswordResetService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        User user = findUserByEmail(request.getEmail());
        String otp = String.valueOf(100000 + random.nextInt(900000));
        otpStore.put(user.getEmail().toLowerCase(), new OtpRecord(otp, LocalDateTime.now().plusMinutes(10), false));
        boolean emailSent = emailService.sendOtp(user.getEmail(), otp);

        if (emailSent) {
            return Map.of(
                    "message", "OTP sent to email",
                    "email", user.getEmail()
            );
        }

        return Map.of(
                "message", "Email is not configured. OTP generated for testing.",
                "email", user.getEmail(),
                "otp", otp
        );
    }

    public Map<String, String> verifyOtp(OtpVerifyRequest request) {
        OtpRecord otpRecord = getValidOtp(request.getEmail(), request.getOtp());
        otpRecord.verified = true;
        return Map.of("message", "OTP verified successfully");
    }

    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        OtpRecord otpRecord = getValidOtp(request.getEmail(), request.getOtp());
        if (!otpRecord.verified) {
            throw new IllegalArgumentException("OTP is not verified");
        }
        User user = findUserByEmail(request.getEmail());
        user.setPassword(request.getNewPassword());
        userRepository.save(user);
        otpStore.remove(user.getEmail().toLowerCase());
        return Map.of("message", "Password reset successfully");
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCaseAndDeletedFalse(email)
                .orElseThrow(() -> new IllegalArgumentException("User email not found"));
    }

    private OtpRecord getValidOtp(String email, String otp) {
        OtpRecord otpRecord = otpStore.get(email.toLowerCase());
        if (otpRecord == null || !otpRecord.otp.equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP");
        }
        if (otpRecord.expiresAt.isBefore(LocalDateTime.now())) {
            otpStore.remove(email.toLowerCase());
            throw new IllegalArgumentException("OTP expired");
        }
        return otpRecord;
    }

    private static class OtpRecord {
        private final String otp;
        private final LocalDateTime expiresAt;
        private boolean verified;

        private OtpRecord(String otp, LocalDateTime expiresAt, boolean verified) {
            this.otp = otp;
            this.expiresAt = expiresAt;
            this.verified = verified;
        }
    }
}
