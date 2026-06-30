package com.university.attendance;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AttendanceApplication {
    public static void main(String[] args) {
        applyRailwayMysqlUrl();
        SpringApplication.run(AttendanceApplication.class, args);
    }

    private static void applyRailwayMysqlUrl() {
        String mysqlUrl = firstPresentEnv("MYSQL_URL", "MYSQL_PUBLIC_URL", "DATABASE_URL", "MYSQL_PRIVATE_URL");
        if (mysqlUrl == null || mysqlUrl.isBlank()) {
            return;
        }

        try {
            URI uri = URI.create(mysqlUrl);
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
                    + "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
                    + "&connectTimeout=30000&socketTimeout=30000";

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

    private static String firstPresentEnv(String... names) {
        for (String name : names) {
            String value = System.getenv(name);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
