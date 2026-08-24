package com.example.base.dto.vocabulary;

import com.example.base.entity.JlptLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/** Tap hop DTO cho response va request cua muc tu vung. */
public final class VocabDtos {
    private VocabDtos() {}

    /** Du lieu mot muc tu vung duoc tra ve qua API. */
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

    /** Du lieu frontend gui len khi tao hoac cap nhat tu vung. */
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
        // Frontend gui lai version da doc khi edit; create khong can field nay.
        private Long version;
    }
}
