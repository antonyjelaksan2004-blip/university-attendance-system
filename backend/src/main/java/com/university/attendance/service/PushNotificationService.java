package com.university.attendance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.attendance.model.Role;
import com.university.attendance.model.User;
import com.university.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class PushNotificationService {
    private static final String EXPO_PUSH_URL =
            "https://exp.host/--/api/v2/push/send";

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public PushNotificationService(
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    public void savePushToken(Long userId, String pushToken) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (!isValidExpoToken(pushToken)) {
            throw new IllegalArgumentException("Invalid Expo push token");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPushToken(pushToken.trim());
        userRepository.save(user);
    }

    public void notifyBatchStudents(
            Long batchId,
            String batchName,
            String sessionName
    ) {
        List<User> students = userRepository
                .findByRoleAndBatchIdAndDeletedFalse(Role.STUDENT, batchId);

        for (User student : students) {
            if (isValidExpoToken(student.getPushToken())) {
                sendClassStartedNotification(
                        student.getPushToken(),
                        batchId,
                        batchName,
                        sessionName
                );
            }
        }
    }

    private void sendClassStartedNotification(
            String pushToken,
            Long batchId,
            String batchName,
            String sessionName
    ) {
        try {
            Map<String, Object> payload = Map.of(
                    "to", pushToken,
                    "sound", "default",
                    "channelId", "class-alerts",
                    "title", "Class Time!",
                    "body", "Your class is live! Join now, stay focused, "
                            + "and keep moving toward your goals.",
                    "data", Map.of(
                            "type", "CLASS_STARTED",
                            "batchId", batchId,
                            "batchName", batchName,
                            "sessionName", sessionName
                    )
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(EXPO_PUSH_URL))
                    .header("Accept", "application/json")
                    .header("Accept-Encoding", "gzip, deflate")
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(
                            objectMapper.writeValueAsString(payload)
                    ))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .exceptionally(error -> null);
        } catch (Exception ignored) {
            // Notification delivery must never prevent the class from starting.
        }
    }

    private boolean isValidExpoToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        String value = token.trim();
        return value.startsWith("ExponentPushToken[")
                || value.startsWith("ExpoPushToken[");
    }
}
