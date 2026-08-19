package com.example.base.dto.exercise;

import com.example.base.entity.JlptLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response DTO for Japanese Grammar Exercise")
public class GrammarExerciseResponse {

    @Schema(description = "Unique exercise ID", example = "1")
    private Long exerciseId;

    @Schema(description = "JLPT level classification", example = "N5")
    private JlptLevel jlptLevel;

    @Schema(description = "Question stem / sentence with gap", example = "わたしは パン (  ) たべます。")
    private String questionText;

    @Schema(description = "Option A", example = "を")
    private String optionA;

    @Schema(description = "Option B", example = "に")
    private String optionB;

    @Schema(description = "Option C", example = "で")
    private String optionC;

    @Schema(description = "Option D", example = "へ")
    private String optionD;

    @Schema(description = "Correct answer option letter", example = "A")
    private String correctOption;

    @Schema(description = "Detailed explanation")
    private String explanation;

    @Schema(description = "Author Lecturer ID", example = "5")
    private Long createdById;

    @Schema(description = "Author Lecturer Name", example = "Yamada Sensei")
    private String createdByName;

    @Schema(description = "Author Lecturer Email", example = "lecturer@japanlearning.com")
    private String createdByEmail;

    @Schema(description = "Created timestamp", example = "2026-08-18T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp", example = "2026-08-18T10:00:00")
    private LocalDateTime updatedAt;
}
