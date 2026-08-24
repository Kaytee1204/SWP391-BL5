package com.example.base.mapper;

import com.example.base.dto.questionbank.request.QuestionUpsertRequest;
import com.example.base.dto.questionset.request.QuestionSetUpsertRequest;
import com.example.base.dto.questionset.response.QuestionSetItemResponse;
import com.example.base.dto.questionset.response.QuestionSetResponse;
import com.example.base.entity.Account;
import com.example.base.entity.QuestionSet;
import com.example.base.entity.QuestionSetItem;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class QuestionSetMapper {
    private final QuestionBankMapper questionBankMapper;

    public QuestionSet toEntity(QuestionSetUpsertRequest request,
                                Account creator){
        return QuestionSet.builder()
                .title(request.getTitle().trim())
                .description(trimNullable(request.getDescription()))
                .skillType(request.getSkillType())
                .jlptLevel(request.getJlptLevel())
                .durationMinutes(request.getDurationMinutes() == null ? 60 : request.getDurationMinutes())
                .createBy(creator)
                .build();
    }

    public void updateEntity(QuestionSetUpsertRequest request, QuestionSet entity){
        entity.setTitle(request.getTitle().trim());

        entity.setDescription(trimNullable(request.getDescription()));
        entity.setSkillType(request.getSkillType());
        entity.setJlptLevel(request.getJlptLevel());
        entity.setDurationMinutes(request.getDurationMinutes() == null ? 60 : request.getDurationMinutes());

    }


    public QuestionSetResponse toResponse(QuestionSet entity, List<QuestionSetItem> items){
        List<QuestionSetItemResponse> questions = items.stream()
                .map(item -> QuestionSetItemResponse.builder()
                        .questionSetItemId(item.getQuestionSetItemId())
                        .questionOrder(item.getQuestionOrder())
                        .question(questionBankMapper.toResponse(item.getQuestion()))
                        .build())
                .toList();
        Account creator = entity.getCreateBy();
        return QuestionSetResponse.builder()
                .questionSetId(entity.getQuestionSetId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .skillType(entity.getSkillType())
                .jlptLevel(entity.getJlptLevel())
                .durationMinutes(entity.getDurationMinutes())
                .createdById(creator == null ? null :creator.getAccountId())
                .createdByName(creator==null ? null : creator.getFullName())
                .questionCount(questions.size())
                .questions(questions)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public QuestionSetResponse toSummaryResponse(
            QuestionSet entity,
            long questionCount
    ) {
        Account creator = entity.getCreateBy();

        return QuestionSetResponse.builder()
                .questionSetId(
                        entity.getQuestionSetId()
                )
                .title(entity.getTitle())
                .description(entity.getDescription())
                .skillType(entity.getSkillType())
                .jlptLevel(entity.getJlptLevel())
                .durationMinutes(entity.getDurationMinutes())
                .createdById(
                        creator == null
                                ? null
                                : creator.getAccountId()
                )
                .createdByName(
                        creator == null
                                ? null
                                : creator.getFullName()
                )
                .questionCount(questionCount)
                .questions(List.of())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private String trimNullable(String value){
        return value == null || value.isBlank() ? null : value.trim();
    }
}
