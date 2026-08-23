package com.example.base.dto.questionbank.response;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionSkillType;
import com.example.base.entity.QuestionType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class QuestionAnswerResponse {
    private Long questionId;
    private QuestionSkillType skillType;
    private JlptLevel jlptLevel;
    private String questionText;
    private QuestionType questionType;
    private String choices;
    private String correctAnswer;
    private String explanation;
    private String duplicateHash;
    private Long createdById;
    private String createdByFullName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}