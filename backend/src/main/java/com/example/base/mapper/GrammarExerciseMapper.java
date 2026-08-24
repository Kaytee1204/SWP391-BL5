package com.example.base.mapper;

import com.example.base.dto.exercise.GrammarExerciseCreateRequest;
import com.example.base.dto.exercise.GrammarExerciseResponse;
import com.example.base.dto.exercise.GrammarExerciseUpdateRequest;
import com.example.base.entity.Account;
import com.example.base.entity.GrammarExercise;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class GrammarExerciseMapper {

    public GrammarExercise toEntity(GrammarExerciseCreateRequest request, Account lecturer) {
        if (request == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();

        return GrammarExercise.builder()
                .jlptLevel(request.getJlptLevel())
                .questionText(request.getQuestionText() != null ? request.getQuestionText().trim() : null)
                .optionA(request.getOptionA() != null ? request.getOptionA().trim() : null)
                .optionB(request.getOptionB() != null ? request.getOptionB().trim() : null)
                .optionC(request.getOptionC() != null ? request.getOptionC().trim() : null)
                .optionD(request.getOptionD() != null ? request.getOptionD().trim() : null)
                .correctOption(request.getCorrectOption() != null ? request.getCorrectOption().trim().toUpperCase() : null)
                .explanation(request.getExplanation() != null ? request.getExplanation().trim() : null)
                .createdBy(lecturer)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public void updateEntityFromDto(GrammarExerciseUpdateRequest request, GrammarExercise exercise) {
        if (request == null || exercise == null) {
            return;
        }

        if (request.getJlptLevel() != null) {
            exercise.setJlptLevel(request.getJlptLevel());
        }
        if (request.getQuestionText() != null && !request.getQuestionText().isBlank()) {
            exercise.setQuestionText(request.getQuestionText().trim());
        }
        if (request.getOptionA() != null && !request.getOptionA().isBlank()) {
            exercise.setOptionA(request.getOptionA().trim());
        }
        if (request.getOptionB() != null && !request.getOptionB().isBlank()) {
            exercise.setOptionB(request.getOptionB().trim());
        }
        if (request.getOptionC() != null && !request.getOptionC().isBlank()) {
            exercise.setOptionC(request.getOptionC().trim());
        }
        if (request.getOptionD() != null && !request.getOptionD().isBlank()) {
            exercise.setOptionD(request.getOptionD().trim());
        }
        if (request.getCorrectOption() != null && !request.getCorrectOption().isBlank()) {
            exercise.setCorrectOption(request.getCorrectOption().trim().toUpperCase());
        }
        if (request.getExplanation() != null) {
            exercise.setExplanation(request.getExplanation().trim());
        }
    }

    public GrammarExerciseResponse toResponse(GrammarExercise exercise) {
        if (exercise == null) {
            return null;
        }

        Account lecturer = exercise.getCreatedBy();

        GrammarExerciseResponse response = new GrammarExerciseResponse();
        response.setExerciseId(exercise.getExerciseId());
        response.setJlptLevel(exercise.getJlptLevel());
        response.setQuestionText(exercise.getQuestionText());
        response.setOptionA(exercise.getOptionA());
        response.setOptionB(exercise.getOptionB());
        response.setOptionC(exercise.getOptionC());
        response.setOptionD(exercise.getOptionD());
        response.setCorrectOption(exercise.getCorrectOption());
        response.setExplanation(exercise.getExplanation());
        response.setCreatedById(lecturer != null ? lecturer.getAccountId() : null);
        response.setCreatedByName(lecturer != null ? lecturer.getFullName() : "Unknown Lecturer");
        response.setCreatedByEmail(lecturer != null ? lecturer.getEmail() : null);
        response.setCreatedAt(exercise.getCreatedAt());
        response.setUpdatedAt(exercise.getUpdatedAt());
        return response;
    }
}
