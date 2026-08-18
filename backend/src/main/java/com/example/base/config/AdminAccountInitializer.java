package com.example.base.config;

import com.example.base.entity.Account;
import com.example.base.entity.AccountStatus;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.Role;
import com.example.base.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
@Order(1)
@RequiredArgsConstructor
public class AdminAccountInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@japanlearning.com";
        if (accountRepository.findByEmail(adminEmail).isEmpty()) {
            Account admin = Account.builder()
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator (Manager)")
                    .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Manager")
                    .role(Role.Manager)
                    .status(AccountStatus.active)
                    .build();

            accountRepository.save(admin);
            log.info("========== ĐÃ KHỞI TẠO TÀI KHOẢN ADMIN/MANAGER MẶC ĐỊNH ==========");
            log.info("👉 Email:    admin@japanlearning.com");
            log.info("👉 Password: admin123");
            log.info("👉 Role:     Manager");
        }

        String studentEmail = "student@japanlearning.com";
        if (accountRepository.findByEmail(studentEmail).isEmpty()) {
            Account student = Account.builder()
                    .email(studentEmail)
                    .passwordHash(passwordEncoder.encode("student123"))
                    .fullName("Nguyễn Văn Học Viên (Student)")
                    .avatarUrl("https://api.dicebear.com/7.x/adventurer/svg?seed=Kenji")
                    .role(Role.Student)
                    .jlptTargetLevel(JlptLevel.N3)
                    .status(AccountStatus.active)
                    .build();

            accountRepository.save(student);
            log.info("👉 Student:  student@japanlearning.com / student123");
        }

        String lecturerEmail = "lecturer@japanlearning.com";
        if (accountRepository.findByEmail(lecturerEmail).isEmpty()) {
            Account lecturer = Account.builder()
                    .email(lecturerEmail)
                    .passwordHash(passwordEncoder.encode("lecturer123"))
                    .fullName("Yamada Sensei (Lecturer)")
                    .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Sensei")
                    .role(Role.Lecturer)
                    .jlptTargetLevel(JlptLevel.N1)
                    .status(AccountStatus.active)
                    .build();

            accountRepository.save(lecturer);
            log.info("👉 Lecturer: lecturer@japanlearning.com / lecturer123");
        }

        String authorEmail = "author@japanlearning.com";
        if (accountRepository.findByEmail(authorEmail).isEmpty()) {
            Account author = Account.builder()
                    .email(authorEmail)
                    .passwordHash(passwordEncoder.encode("author123"))
                    .fullName("Tanaka Author (Culture)")
                    .avatarUrl("https://api.dicebear.com/7.x/adventurer/svg?seed=Sakura")
                    .role(Role.Author)
                    .jlptTargetLevel(JlptLevel.N2)
                    .status(AccountStatus.active)
                    .build();

            accountRepository.save(author);
            log.info("👉 Author:   author@japanlearning.com / author123");
        }
    }
}
