package com.example.base.config;

import com.example.base.entity.Account;
import com.example.base.entity.CultureArticle;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.CultureArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@Order(2) // Runs after AdminAccountInitializer (Order 1)
@RequiredArgsConstructor
public class CultureArticleInitializer implements CommandLineRunner {

    private final CultureArticleRepository cultureArticleRepository;
    private final AccountRepository accountRepository;

    @Override
    public void run(String... args) {
        log.info("CultureArticleInitializer: Sẵn sàng cho người dùng tự tạo bài viết.");
    }
}
