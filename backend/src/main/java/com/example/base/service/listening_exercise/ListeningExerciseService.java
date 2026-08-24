package com.example.base.service.listening_exercise;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.listening_exercise.request.ListeningExerciseCreateRequest;
import com.example.base.dto.listening_exercise.request.ListeningExerciseUpdateRequest;
import com.example.base.dto.listening_exercise.response.ListeningExerciseResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ListeningExerciseService {

    PageResponse<ListeningExerciseResponse> search(
            String keyword,
            JlptLevel jlptLevel,
            Pageable pageable
    );

    PageResponse<ListeningExerciseResponse> searchMine(
            String keyword,
            JlptLevel jlptLevel,
            UserPrincipal currentUser,
            Pageable pageable
    );

    ListeningExerciseResponse getById(Long id);

    ListeningExerciseResponse create(
            ListeningExerciseCreateRequest request,
            MultipartFile audio,
            UserPrincipal currentUser
    );

    ListeningExerciseResponse update(
            Long id,
            ListeningExerciseUpdateRequest request,
            MultipartFile replacementAudio,
            UserPrincipal currentUser
    );

    void delete(Long id, UserPrincipal currentUser);
}
