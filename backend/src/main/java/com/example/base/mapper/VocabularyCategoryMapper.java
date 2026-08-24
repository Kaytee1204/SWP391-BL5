package com.example.base.mapper;

import org.springframework.stereotype.Component;

import com.example.base.dto.vocabulary_category.VocabularyCategoryCreateRequest;
import com.example.base.dto.vocabulary_category.VocabularyCategoryResponse;
import com.example.base.entity.VocabularyCategory;

@Component
/**
 * Ánh xạ category giữa request, entity và response. Mapper chỉ sao chép field trực tiếp;
 * các field tổng hợp như itemCount/createdByName được service bổ sung sau.
 */
public class VocabularyCategoryMapper {

    public VocabularyCategoryResponse toResponse(VocabularyCategory entity) {
        // Trả null sớm giúp mapper an toàn khi được gọi với dữ liệu tùy chọn.
        if (entity == null) return null;

        return VocabularyCategoryResponse.builder()
                .categoryId(entity.getCategoryId())
                .jlptLevel(entity.getJlptLevel())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdById(entity.getCreatedBy() != null ? entity.getCreatedBy().getAccountId() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public VocabularyCategory toEntity(VocabularyCategoryCreateRequest request) {
        // Không gắn createdBy ở đây vì Account phải được service nạp bằng creatorId từ JWT.
        if (request == null) return null;

        return VocabularyCategory.builder()
                .jlptLevel(request.getJlptLevel())
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }
}
