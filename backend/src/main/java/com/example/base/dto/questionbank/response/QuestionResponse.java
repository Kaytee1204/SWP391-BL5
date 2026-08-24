package com.example.base.dto.questionbank.response;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionSkillType;
import com.example.base.entity.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse { // chứa dữ liệu câu hỏi trả về fe
    private Long questionId;
    private QuestionSkillType skillType;
    private JlptLevel jlptLevel;
    private String questionText;
    private QuestionType questionType;
    private List<String> choices;
    private List<String> correctAnswers;
    private String explanation;

    private Long createdById;
    private String createdByName;
    private String createdByEmail;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}

//khong tra entiry truc tiep
//tranh serialize quan he lazy createdBy
//tra choices duoi dang mang thay vi chuoi json
//khong vo tinh tra passwordHash cua tai khoan lecturer


