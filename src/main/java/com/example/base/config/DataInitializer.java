package com.example.base.config;

import com.example.base.entity.Role;
import com.example.base.entity.User;
import com.example.base.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Khởi tạo tài khoản mẫu...");

            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@example.com")
                    .fullName("System Administrator")
                    .roles(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER))
                    .enabled(true)
                    .build();
            userRepository.save(admin);

            User user = User.builder()
                    .username("user")
                    .password(passwordEncoder.encode("user123"))
                    .email("user@example.com")
                    .fullName("Regular User")
                    .roles(Set.of(Role.ROLE_USER))
                    .enabled(true)
                    .build();
            userRepository.save(user);

            log.info("Tài khoản mặc định:");
            log.info("  1. Admin -> username: admin / password: admin123");
            log.info("  2. User  -> username: user  / password: user123");
        }
    }
}
