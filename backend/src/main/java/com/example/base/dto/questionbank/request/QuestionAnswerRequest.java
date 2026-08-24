package com.example.base.dto.questionbank.request;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionSkillType;
import com.example.base.entity.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionAnswerRequest {
    @NotNull(message = "Skill type không được để trống")
    private QuestionSkillType skillType;

    @NotNull(message = "JLPT level không được để trống")
    private JlptLevel jlptLevel;

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String questionText;

    @NotNull(message = "Loại câu hỏi không được để trống")
    private QuestionType questionType;

    private String choices;

    @NotBlank(message = "Đáp án đúng không được để trống")
    private String correctAnswer;

    private String explanation;

    private String duplicateHash;

    @NotNull(message = "ID người tạo (created_by) không được để trống")
    private Long createdById;
}