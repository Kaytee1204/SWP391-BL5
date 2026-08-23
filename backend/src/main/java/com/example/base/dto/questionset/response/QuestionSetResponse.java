package com.example.base.dto.questionset.response;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionSkillType;
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
public class QuestionSetResponse {
    private Long questionSetId;
    private String title;
    private String description;
    private QuestionSkillType skillType;
    private JlptLevel jlptLevel;

    private Long createdById;
    private String createdByName;

    private long questionCount;
    private List<QuestionSetItemResponse> questions;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
