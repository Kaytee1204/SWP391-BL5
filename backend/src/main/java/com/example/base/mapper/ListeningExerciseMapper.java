package com.example.base.mapper;

import com.example.base.dto.listening_exercise.request.ListeningExerciseCreateRequest;
import com.example.base.dto.listening_exercise.request.ListeningExerciseUpdateRequest;
import com.example.base.dto.listening_exercise.response.ListeningExerciseResponse;
import com.example.base.entity.Account;
import com.example.base.entity.ListeningExercise;
import com.example.base.service.listening_exercise.ListeningAudioStorageService.StoredAudio;
import org.springframework.stereotype.Component;

@Component
public class ListeningExerciseMapper {

    public ListeningExercise toEntity(
            ListeningExerciseCreateRequest request,
            Account creator,
            StoredAudio audio
    ) {
        return ListeningExercise.builder()
                .jlptLevel(request.getJlptLevel())
                .title(request.getTitle().trim())
                .scriptText(request.getScriptText().trim())
                .translation(trimNullable(request.getTranslation()))
                .audioUrl(audio.url())
                .audioStorageName(audio.storageName())
                .audioOriginalName(audio.originalName())
                .createdBy(creator)
                .build();
    }

    public void updateEntity(
            ListeningExerciseUpdateRequest request,
            ListeningExercise entity,
            StoredAudio replacementAudio
    ) {
        entity.setJlptLevel(request.getJlptLevel());
        entity.setTitle(request.getTitle().trim());
        entity.setScriptText(request.getScriptText().trim());
        entity.setTranslation(trimNullable(request.getTranslation()));

        if (replacementAudio != null) {
            entity.setAudioUrl(replacementAudio.url());
            entity.setAudioStorageName(replacementAudio.storageName());
            entity.setAudioOriginalName(replacementAudio.originalName());
        }
    }

    public ListeningExerciseResponse toResponse(ListeningExercise entity) {
        Account creator = entity.getCreatedBy();
        return ListeningExerciseResponse.builder()
                .listeningExerciseId(entity.getListeningExerciseId())
                .jlptLevel(entity.getJlptLevel())
                .title(entity.getTitle())
                .audioUrl(entity.getAudioUrl())
                .audioOriginalName(entity.getAudioOriginalName())
                .scriptText(entity.getScriptText())
                .translation(entity.getTranslation())
                .createdById(creator == null ? null : creator.getAccountId())
                .createdByName(creator == null ? null : creator.getFullName())
                .createdByEmail(creator == null ? null : creator.getEmail())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private String trimNullable(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
