package com.example.base.dto.vocabulary;

import java.time.LocalDateTime;

import com.example.base.entity.JlptLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Các object đi qua biên API của màn 32-35. DTO response làm phẳng entity/category/audit;
 * request chỉ chứa trường client được phép nhập, không có createdBy hoặc updatedBy.
 */
public final class VocabDtos {
    private VocabDtos() {}

    /** Dữ liệu mục từ trả về; categoryName và JLPT giúp bảng render mà không gọi API phụ. */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class VocabItemDto {
        private Long itemId;
        private Long categoryId;
        private String categoryName;
        private JlptLevel jlptLevel;
        private String word;
        private String kanji;
        private String reading;
        private String meaning;
        private String exampleSentence;
        private String exampleTranslation;
        private String createdBy;
        private String updatedBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Long version;
    }

    /** Payload dùng chung cho tạo/cập nhật; Bean Validation chặn trường bắt buộc trước service. */
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class VocabItemRequest {
        @NotNull(message = "Category ID is required")
        private Long categoryId;
        @NotBlank(message = "Word is required")
        private String word;
        private String kanji;
        @NotBlank(message = "Reading is required")
        private String reading;
        @NotBlank(message = "Meaning is required")
        private String meaning;
        private String exampleSentence;
        private String exampleTranslation;
        // Frontend gửi lại version đã đọc khi edit; create không cần field này.
        private Long version;
    }
}
