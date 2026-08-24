package com.example.base.repository.specification;

import com.example.base.entity.Account;
import com.example.base.entity.Course;
import com.example.base.entity.Payment;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class PaymentSpecification {

    public static Specification<Payment> filter(String keyword, String status) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Keyword search (Student Name, Email, Course Title, or Order Code)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.trim().toLowerCase() + "%";
                Join<Payment, Account> studentJoin = root.join("student", JoinType.LEFT);
                Join<Payment, Course> courseJoin = root.join("course", JoinType.LEFT);

                Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(studentJoin.get("fullName")), searchPattern);
                Predicate emailPredicate = criteriaBuilder.like(criteriaBuilder.lower(studentJoin.get("email")), searchPattern);
                Predicate coursePredicate = criteriaBuilder.like(criteriaBuilder.lower(courseJoin.get("title")), searchPattern);

                Predicate keywordPredicate = criteriaBuilder.or(namePredicate, emailPredicate, coursePredicate);

                // If keyword contains digits, match orderCode as well
                String digitsOnly = keyword.trim().replaceAll("[^0-9]", "");
                if (!digitsOnly.isEmpty()) {
                    try {
                        Long code = Long.parseLong(digitsOnly);
                        Predicate orderCodePredicate = criteriaBuilder.equal(root.get("orderCode"), code);
                        keywordPredicate = criteriaBuilder.or(keywordPredicate, orderCodePredicate);
                    } catch (NumberFormatException ignored) {}
                }

                predicates.add(keywordPredicate);
            }

            // 2. Status filter (ALL, paid, pending)
            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("status")), status.trim().toLowerCase()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
