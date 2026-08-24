package com.example.base.dto.student_exam.response;
import com.example.base.entity.*;
import lombok.*;
@Data @Builder public class StudentExamSummaryResponse { private Long questionSetId; private String title; private String description; private QuestionSkillType skillType; private JlptLevel jlptLevel; private Integer durationMinutes; private long questionCount; }
