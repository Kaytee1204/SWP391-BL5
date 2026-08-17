package com.example.base;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SpringBootBaseApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootBaseApplication.class, args);
    }
}
