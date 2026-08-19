package com.example.base.dto.grammar;

import com.example.base.entity.JlptLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for updating an existing Grammar Pattern")
public class GrammarPatternUpdateRequest {

    @Schema(description = "Target JLPT level (N1, N2, N3, N4, N5)", example = "N4")
    private JlptLevel jlptLevel;

    @Size(max = 200, message = "Title must not exceed 200 characters")
    @Schema(description = "Title or name of the grammar pattern", example = "〜なければなりません (Must / Have to do)")
    private String title;

    @Size(max = 300, message = "Structure formula must not exceed 300 characters")
    @Schema(description = "Grammar formation formula/structure", example = "V-ない (bỏ い) + ければなりません")
    private String structure;

    @Schema(description = "Usage note, meaning, explanations, and example sentences")
    private String usageNote;
}
