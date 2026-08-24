package com.example.base.repository;

import com.example.base.entity.TestAttempt;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    Page<TestAttempt> findByStudentAccountId(Long studentId, Pageable pageable);
    Optional<TestAttempt> findFirstByStudentAccountIdAndQuestionSetQuestionSetIdAndStatusOrderByStartedAtDesc(Long studentId, Long setId, String status);
}
