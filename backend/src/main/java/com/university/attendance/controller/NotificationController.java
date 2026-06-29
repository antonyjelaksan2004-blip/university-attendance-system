package com.university.attendance.controller;

import com.university.attendance.dto.PushTokenRequest;
import com.university.attendance.service.PushNotificationService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final PushNotificationService pushNotificationService;

    public NotificationController(
            PushNotificationService pushNotificationService
    ) {
        this.pushNotificationService = pushNotificationService;
    }

    @PostMapping("/push-token")
    public Map<String, String> savePushToken(
            @RequestBody PushTokenRequest request
    ) {
        pushNotificationService.savePushToken(
                request.getUserId(),
                request.getPushToken()
        );
        return Map.of("message", "Push token saved successfully");
    }
}
