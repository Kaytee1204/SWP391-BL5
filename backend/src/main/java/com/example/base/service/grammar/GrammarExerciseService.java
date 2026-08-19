package com.example.base.service.grammar;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.exercise.GrammarExerciseCreateRequest;
import com.example.base.dto.exercise.GrammarExerciseResponse;
import com.example.base.dto.exercise.GrammarExerciseUpdateRequest;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface GrammarExerciseService {

    PageResponse<GrammarExerciseResponse> searchExercises(String keyword, JlptLevel jlptLevel, Pageable pageable);

    PageResponse<GrammarExerciseResponse> searchMyExercises(String keyword, JlptLevel jlptLevel, UserPrincipal currentUser, Pageable pageable);

    GrammarExerciseResponse getExerciseById(Long exerciseId);

    GrammarExerciseResponse createExercise(GrammarExerciseCreateRequest request, UserPrincipal currentUser);

    GrammarExerciseResponse updateExercise(Long exerciseId, GrammarExerciseUpdateRequest request, UserPrincipal currentUser);

    void deleteExercise(Long exerciseId, UserPrincipal currentUser);
}
