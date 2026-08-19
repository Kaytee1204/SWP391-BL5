package com.example.base.dto.vocabulary;

import com.example.base.entity.JlptLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public final class VocabDtos {
    private VocabDtos() {}

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class VocabCategoryDto {
        private Long categoryId;
        private JlptLevel jlptLevel;
        private String name;
        private String description;
        private Long createdById;
        private String createdByName;
        private Integer itemCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class VocabCategoryRequest {
        @NotNull(message = "JLPT level is required")
        private JlptLevel jlptLevel;
        @NotBlank(message = "Category name is required")
        private String name;
        private String description;
    }

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
        private String audioUrl;
        private String exampleSentence;
        private String exampleTranslation;
        private Boolean isPreview;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

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
        private String audioUrl;
        private String exampleSentence;
        private String exampleTranslation;
        private Boolean isPreview;
    }
}
