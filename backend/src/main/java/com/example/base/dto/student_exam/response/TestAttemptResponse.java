package com.example.base.dto.student_exam.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder public class TestAttemptResponse { private Long attemptId; private Long questionSetId; private String title; private String jlptLevel; private String skillType; private Integer durationMinutes; private Long score; private Long totalScore; private String status; private String reviewNote; private LocalDateTime startedAt; private LocalDateTime submittedAt; private Long remainingSeconds; private List<StudentExamQuestionResponse> questions; }
