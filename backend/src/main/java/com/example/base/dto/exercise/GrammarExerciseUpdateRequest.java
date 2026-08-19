package com.example.base.dto.exercise;

import com.example.base.entity.JlptLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for updating an existing Grammar Multiple-Choice Exercise")
public class GrammarExerciseUpdateRequest {

    @Schema(description = "Target JLPT level (N1, N2, N3, N4, N5)", example = "N4")
    private JlptLevel jlptLevel;

    @Schema(description = "Question stem text")
    private String questionText;

    @Size(max = 500, message = "Option A must not exceed 500 characters")
    @Schema(description = "Option A text")
    private String optionA;

    @Size(max = 500, message = "Option B must not exceed 500 characters")
    @Schema(description = "Option B text")
    private String optionB;

    @Size(max = 500, message = "Option C must not exceed 500 characters")
    @Schema(description = "Option C text")
    private String optionC;

    @Size(max = 500, message = "Option D must not exceed 500 characters")
    @Schema(description = "Option D text")
    private String optionD;

    @Pattern(regexp = "^[A-Da-d]$", message = "Correct option must be 'A', 'B', 'C', or 'D'")
    @Schema(description = "Correct answer option letter ('A', 'B', 'C', 'D')", example = "B")
    private String correctOption;

    @Schema(description = "Grammatical explanation")
    private String explanation;
}
