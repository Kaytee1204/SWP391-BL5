package com.example.base.dto;

import com.example.base.entity.JlptLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public final class KanjiDtos {
    private KanjiDtos() {}

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class KanjiModuleDto {
        private Long moduleId;
        private JlptLevel jlptLevel;
        private String title;
        private String description;
        private Long createdById;
        private String createdByName;
        private Integer kanjiCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class KanjiModuleRequest {
        @NotNull(message = "JLPT level is required")
        private JlptLevel jlptLevel;
        @NotBlank(message = "Module title is required")
        private String title;
        private String description;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class KanjiDetailDto {
        private Long kanjiId;
        private Long moduleId;
        private String moduleTitle;
        private JlptLevel jlptLevel;
        private String character;
        private String onyomi;
        private String kunyomi;
        private String strokeOrderUrl;
        private String meaning;
        private String compoundWords;
        private Boolean isPreview;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class KanjiDetailRequest {
        @NotNull(message = "Module ID is required")
        private Long moduleId;
        @NotBlank(message = "Kanji character is required")
        private String character;
        private String onyomi;
        private String kunyomi;
        private String strokeOrderUrl;
        @NotBlank(message = "Meaning is required")
        private String meaning;
        private String compoundWords;
        private Boolean isPreview;
    }
}
