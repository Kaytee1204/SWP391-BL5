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


        return GrammarExampleResponse.builder()
                .exampleId(entity.getExampleId())
                .patternId(patternId)
                .sentenceJp(entity.getSentenceJp())
                .translation(entity.getTranslation())
                .audioUrl(entity.getAudioUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}