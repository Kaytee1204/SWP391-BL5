package com.example.base.dto.exercise;

import com.example.base.entity.JlptLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Schema(description = "Request DTO for creating a new Japanese Grammar Multiple-Choice Exercise")
public class GrammarExerciseCreateRequest {

    @NotNull(message = "JLPT Level is required")
    @Schema(description = "Target JLPT level (N1, N2, N3, N4, N5)", example = "N5", requiredMode = Schema.RequiredMode.REQUIRED)
    private JlptLevel jlptLevel;

    @NotBlank(message = "Question text is required")
    @Schema(description = "Multiple choice question stem / sentence with blank", example = "わたしは パン (  ) たべます。", requiredMode = Schema.RequiredMode.REQUIRED)
    private String questionText;

    @NotBlank(message = "Option A is required")
    @Size(max = 500, message = "Option A must not exceed 500 characters")
    @Schema(description = "Option A text", example = "を", requiredMode = Schema.RequiredMode.REQUIRED)
    private String optionA;

    @NotBlank(message = "Option B is required")
    @Size(max = 500, message = "Option B must not exceed 500 characters")
    @Schema(description = "Option B text", example = "に", requiredMode = Schema.RequiredMode.REQUIRED)
    private String optionB;

    @NotBlank(message = "Option C is required")
    @Size(max = 500, message = "Option C must not exceed 500 characters")
    @Schema(description = "Option C text", example = "で", requiredMode = Schema.RequiredMode.REQUIRED)
    private String optionC;

    @NotBlank(message = "Option D is required")
    @Size(max = 500, message = "Option D must not exceed 500 characters")
    @Schema(description = "Option D text", example = "へ", requiredMode = Schema.RequiredMode.REQUIRED)
    private String optionD;

    @NotBlank(message = "Correct option is required ('A', 'B', 'C', or 'D')")
    @Pattern(regexp = "^[A-Da-d]$", message = "Correct option must be 'A', 'B', 'C', or 'D'")
    @Schema(description = "Correct answer option letter", example = "A", requiredMode = Schema.RequiredMode.REQUIRED)
    private String correctOption;

    @Schema(description = "Detailed grammatical explanation and breakdown", example = "Trợ từ 'を' (wo) đứng trước tha động từ 'たべます' (ăn) để chỉ đối tượng tác động trực tiếp là bánh mì.")
    private String explanation;
}
