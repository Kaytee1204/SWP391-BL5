package com.example.base.mapper;

import com.example.base.dto.grammar.GrammarPatternCreateRequest;
import com.example.base.dto.grammar.GrammarPatternResponse;
import com.example.base.dto.grammar.GrammarPatternUpdateRequest;
import com.example.base.entity.Account;
import com.example.base.entity.GrammarPattern;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class GrammarPatternMapper {

    public GrammarPattern toEntity(GrammarPatternCreateRequest request, Account lecturer) {
        if (request == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();

        return GrammarPattern.builder()
                .jlptLevel(request.getJlptLevel())
                .title(request.getTitle() != null ? request.getTitle().trim() : null)
                .structure(request.getStructure() != null ? request.getStructure().trim() : null)
                .usageNote(request.getUsageNote() != null ? request.getUsageNote().trim() : null)
                .createdBy(lecturer)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public void updateEntityFromDto(GrammarPatternUpdateRequest request, GrammarPattern pattern) {
        if (request == null || pattern == null) {
            return;
        }

        if (request.getJlptLevel() != null) {
            pattern.setJlptLevel(request.getJlptLevel());
        }
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            pattern.setTitle(request.getTitle().trim());
        }
        if (request.getStructure() != null && !request.getStructure().isBlank()) {
            pattern.setStructure(request.getStructure().trim());
        }
        if (request.getUsageNote() != null) {
            pattern.setUsageNote(request.getUsageNote().trim());
        }
    }

    public GrammarPatternResponse toResponse(GrammarPattern pattern) {
        if (pattern == null) {
            return null;
        }

        Account lecturer = pattern.getCreatedBy();

        GrammarPatternResponse response = new GrammarPatternResponse();
        response.setPatternId(pattern.getPatternId());
        response.setJlptLevel(pattern.getJlptLevel());
        response.setTitle(pattern.getTitle());
        response.setStructure(pattern.getStructure());
        response.setUsageNote(pattern.getUsageNote());
        response.setCreatedById(lecturer != null ? lecturer.getAccountId() : null);
        response.setCreatedByAccountId(lecturer != null ? lecturer.getAccountId() : null);
        response.setCreatedByName(lecturer != null ? lecturer.getFullName() : "Unknown Lecturer");
        response.setCreatedByEmail(lecturer != null ? lecturer.getEmail() : null);
        response.setCreatedByAvatarUrl(lecturer != null ? lecturer.getAvatarUrl() : null);
        response.setCreatedAt(pattern.getCreatedAt());
        response.setUpdatedAt(pattern.getUpdatedAt());
        return response;
    }
}
