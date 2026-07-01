package com.university.attendance;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AttendanceApplication {
    public static void main(String[] args) {
        applyRailwayMysqlUrl();
        SpringApplication.run(AttendanceApplication.class, args);
    }

    private static void applyRailwayMysqlUrl() {
        if (System.getenv("SPRING_DATASOURCE_URL") != null) {
            return;
        }

        List<DatabaseConfig> candidates = new ArrayList<>();
        addUrlCandidate(candidates, "MYSQL_PUBLIC_URL");
        addUrlCandidate(candidates, "DATABASE_URL");
        addHostCandidate(candidates);
        addUrlCandidate(candidates, "MYSQL_URL");
        addUrlCandidate(candidates, "MYSQL_PRIVATE_URL");

        for (DatabaseConfig candidate : candidates) {
            if (canConnect(candidate)) {
                useDatabase(candidate);
                System.out.println("Using MySQL connection from " + candidate.source());
                return;
            }
        }

        if (!candidates.isEmpty()) {
            DatabaseConfig fallback = candidates.get(0);
            useDatabase(fallback);
            System.out.println("No MySQL candidate responded during startup; falling back to " + fallback.source());
        }
    }

    private static void addUrlCandidate(List<DatabaseConfig> candidates, String envName) {
        String mysqlUrl = System.getenv(envName);
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
            candidates.add(new DatabaseConfig(envName, buildJdbcUrl(uri.getHost(), uri.getPort(), database), username, password));
        } catch (RuntimeException ignored) {
            // Invalid environment variable; ignore this candidate.
        }
    }

    private static void addHostCandidate(List<DatabaseConfig> candidates) {
        String host = System.getenv("MYSQLHOST");
        if (host == null || host.isBlank()) {
            return;
        }

        String port = valueOrDefault(System.getenv("MYSQLPORT"), "3306");
        String database = valueOrDefault(System.getenv("MYSQLDATABASE"), "railway");
        String username = valueOrDefault(System.getenv("MYSQLUSER"), "root");
        String password = valueOrDefault(System.getenv("MYSQLPASSWORD"), "");

        candidates.add(new DatabaseConfig("MYSQLHOST", buildJdbcUrl(host, parsePort(port), database), username, password));
    }

    private static String buildJdbcUrl(String host, int port, String database) {
        return "jdbc:mysql://" + host + ":" + port + "/" + database
                + "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
                + "&connectTimeout=10000&socketTimeout=30000";
    }

    private static boolean canConnect(DatabaseConfig config) {
        DriverManager.setLoginTimeout(10);
        for (int attempt = 1; attempt <= 3; attempt++) {
            try (Connection ignored = DriverManager.getConnection(config.jdbcUrl(), config.username(), config.password())) {
                return true;
            } catch (SQLException ignored) {
                sleep(2000);
            }
        }
        return false;
    }

    private static void useDatabase(DatabaseConfig config) {
        System.setProperty("spring.datasource.url", config.jdbcUrl());
        if (!config.username().isBlank()) {
            System.setProperty("spring.datasource.username", config.username());
        }
        System.setProperty("spring.datasource.password", config.password());
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static int parsePort(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ignored) {
            return 3306;
        }
    }

    private static String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static void sleep(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        }
    }

    private record DatabaseConfig(String source, String jdbcUrl, String username, String password) {
    }
}
