package com.university.attendance;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AttendanceApplication {
    public static void main(String[] args) {
        applyRailwayMysqlPublicUrl();
        SpringApplication.run(AttendanceApplication.class, args);
    }

    private static void applyRailwayMysqlPublicUrl() {
        String mysqlPublicUrl = System.getenv("MYSQL_PUBLIC_URL");
        if (mysqlPublicUrl == null || mysqlPublicUrl.isBlank()) {
            return;
        }

        try {
            URI uri = URI.create(mysqlPublicUrl);
            String userInfo = uri.getUserInfo();
            String username = "";
            String password = "";

            if (userInfo != null) {
                String[] parts = userInfo.split(":", 2);
                username = decode(parts[0]);
                password = parts.length > 1 ? decode(parts[1]) : "";
            }

            String database = uri.getPath() == null ? "" : uri.getPath().replaceFirst("^/", "");
            String jdbcUrl = "jdbc:mysql://" + uri.getHost() + ":" + uri.getPort() + "/" + database
                    + "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";

            System.setProperty("spring.datasource.url", jdbcUrl);
            if (!username.isBlank()) {
                System.setProperty("spring.datasource.username", username);
            }
            if (!password.isBlank()) {
                System.setProperty("spring.datasource.password", password);
            }
        } catch (RuntimeException ignored) {
            // Fall back to MYSQLHOST/MYSQLPORT/MYSQLDATABASE variables.
        }
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
