package com.example.base.mapper;

import com.example.base.dto.grammar_example.GrammarExampleRequest;
import com.example.base.dto.grammar_example.GrammarExampleResponse;
import com.example.base.entity.GrammarExample;
import org.springframework.stereotype.Component;

@Component
public class GrammarExampleMapper {

    public GrammarExample toEntity(GrammarExampleRequest request) {
        if (request == null) return null;

        return GrammarExample.builder()
                .sentenceJp(request.getSentenceJp().trim())
                .translation(request.getTranslation().trim())
                .audioUrl(request.getAudioUrl() != null ? request.getAudioUrl().trim() : null)
                .build();
    }

    public GrammarExampleResponse toResponse(GrammarExample entity) {
        if (entity == null) return null;

        Long patternId = null;
        if (entity.getPattern() != null) {
            patternId = entity.getPattern().getPatternId();
        }

        GrammarExampleResponse response = new GrammarExampleResponse();
        response.setExampleId(entity.getExampleId());
        response.setPatternId(patternId);
        response.setSentenceJp(entity.getSentenceJp());
        response.setTranslation(entity.getTranslation());
        response.setAudioUrl(entity.getAudioUrl());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
}