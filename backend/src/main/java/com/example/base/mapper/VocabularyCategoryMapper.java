package com.example.base.mapper;

import org.springframework.stereotype.Component;

import com.example.base.dto.vocabulary_category.VocabularyCategoryCreateRequest;
import com.example.base.dto.vocabulary_category.VocabularyCategoryResponse;
import com.example.base.entity.VocabularyCategory;

@Component
public class VocabularyCategoryMapper {

    public VocabularyCategoryResponse toResponse(VocabularyCategory entity) {
        if (entity == null) return null;

        return VocabularyCategoryResponse.builder()
                .categoryId(entity.getCategoryId())
                .jlptLevel(entity.getJlptLevel())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdById(entity.getCreatedBy() != null ? entity.getCreatedBy().getAccountId() : null)
                .createdByName(entity.getCreatedBy() != null ? entity.getCreatedBy().getFullName() : null)
                .itemCount(entity.getItems() != null ? entity.getItems().size() : 0)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public VocabularyCategory toEntity(VocabularyCategoryCreateRequest request) {
        if (request == null) return null;

        return VocabularyCategory.builder()
                .jlptLevel(request.getJlptLevel())
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }
}
