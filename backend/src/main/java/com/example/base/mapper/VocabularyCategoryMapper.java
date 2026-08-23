package com.example.base.mapper;

import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

import com.example.base.dto.vocabulary_category.VocabularyCategoryCreateRequest;
import com.example.base.dto.vocabulary_category.VocabularyCategoryResponse;
import com.example.base.dto.vocabulary_category.VocabularyItemDto; // Đảm bảo đã import DTO con này
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
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                // Map sang VocabularyItemDto chuẩn kiểu dữ liệu
                .items(entity.getItems() != null ? entity.getItems().stream()
                        .map(item -> VocabularyItemDto.builder()
                                .itemId(item.getItemId())
                                .wordJp(item.getWord()) // Hoặc .word(item.getWord()) tùy vào định nghĩa trường trong VocabularyItemDto của bạn
                                .meaning(item.getMeaning())
                                .build())
                        .collect(Collectors.toList()) : null)
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