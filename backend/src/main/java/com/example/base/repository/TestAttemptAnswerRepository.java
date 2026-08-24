package com.example.base.repository;

import com.example.base.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface TestAttemptAnswerRepository extends JpaRepository<TestAttemptAnswer, TestAttemptAnswerId> {
    List<TestAttemptAnswer> findByAttemptAttemptId(Long attemptId);
    Optional<TestAttemptAnswer> findByAttemptAttemptIdAndQuestionQuestionId(Long attemptId, Long questionId);
}
