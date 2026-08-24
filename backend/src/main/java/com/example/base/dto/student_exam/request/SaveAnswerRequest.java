package com.example.base.dto.student_exam.request;
import lombok.Data;
import java.util.List;
@Data public class SaveAnswerRequest { private List<String> selectedAnswers; private String note; }
