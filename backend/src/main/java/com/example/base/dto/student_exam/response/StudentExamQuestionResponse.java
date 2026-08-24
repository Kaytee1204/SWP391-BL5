package com.example.base.dto.student_exam.response;
import com.example.base.entity.QuestionType;
import lombok.*;
import java.util.List;
@Data @Builder public class StudentExamQuestionResponse { private Long questionId; private Integer questionOrder; private String questionText; private QuestionType questionType; private List<String> choices; private List<String> selectedAnswers; private String note; private Boolean correct; private List<String> correctAnswers; private String explanation; }
