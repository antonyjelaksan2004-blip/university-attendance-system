package com.university.attendance.config;

import com.university.attendance.model.Role;
import com.university.attendance.model.User;
import com.university.attendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {
    private final UserRepository userRepository;
    private final String name;
    private final String email;
    private final String password;
    private final String phone;

    public AdminBootstrap(
            UserRepository userRepository,
            @Value("${app.admin.name}") String name,
            @Value("${app.admin.email}") String email,
            @Value("${app.admin.password}") String password,
            @Value("${app.admin.phone}") String phone
    ) {
        this.userRepository = userRepository;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.findByEmailIgnoreCaseAndDeletedFalseOrderByIdDesc(email).isEmpty()) {
            return;
        }

        userRepository.save(new User(null, name, email, password, phone, Role.SUPER_ADMIN));
    }
}
