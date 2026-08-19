package com.example.base.dto.kanji;

import com.example.base.entity.JlptLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
        @Size(max = 150, message = "Module title must not exceed 150 characters")
        private String title;
        @Size(max = 500, message = "Module description must not exceed 500 characters")
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
        @Size(max = 10, message = "Kanji character must not exceed 10 characters")
        private String character;
        @Size(max = 200, message = "Onyomi must not exceed 200 characters")
        private String onyomi;
        @Size(max = 200, message = "Kunyomi must not exceed 200 characters")
        private String kunyomi;
        @Size(max = 500, message = "Stroke order URL must not exceed 500 characters")
        private String strokeOrderUrl;
        @NotBlank(message = "Meaning is required")
        @Size(max = 300, message = "Meaning must not exceed 300 characters")
        private String meaning;
        private String compoundWords;
        private Boolean isPreview;
    }
}
