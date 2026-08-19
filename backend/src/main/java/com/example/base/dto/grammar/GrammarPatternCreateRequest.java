package com.example.base.dto.grammar;

import com.example.base.entity.JlptLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for creating a new Japanese Grammar Pattern (Lecturer only)")
public class GrammarPatternCreateRequest {

    @NotNull(message = "JLPT Level is required")
    @Schema(description = "Target JLPT level (N1, N2, N3, N4, N5)", example = "N5", requiredMode = Schema.RequiredMode.REQUIRED)
    private JlptLevel jlptLevel;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    @Schema(description = "Title or name of the grammar pattern", example = "〜てもいいです (Permission: May / Can do)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;

    @NotBlank(message = "Structure is required")
    @Size(max = 300, message = "Structure formula must not exceed 300 characters")
    @Schema(description = "Grammar formation formula/structure", example = "V-て + もいいです", requiredMode = Schema.RequiredMode.REQUIRED)
    private String structure;

    @Schema(description = "Usage note, meaning, explanations, and example sentences", example = "Dùng để diễn tả sự cho phép làm một việc gì đó. Ví dụ: 写真を撮ってもいいです (Bạn có thể chụp ảnh).")
    private String usageNote;
}
