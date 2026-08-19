package com.example.base.dto.grammar;

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
@Schema(description = "Response DTO for Japanese Grammar Pattern")
public class GrammarPatternResponse {

    @Schema(description = "Unique grammar pattern ID", example = "1")
    private Long patternId;

    @Schema(description = "JLPT level classification", example = "N5")
    private JlptLevel jlptLevel;

    @Schema(description = "Grammar pattern title / name", example = "〜てもいいです (Permission: May / Can do)")
    private String title;

    @Schema(description = "Grammar formula / structure", example = "V-て + もいいです")
    private String structure;

    @Schema(description = "Detailed explanation, rules, and example sentences")
    private String usageNote;

    @Schema(description = "Lecturer Account ID who created the pattern", example = "5")
    private Long createdById;

    @Schema(description = "Lecturer Full Name", example = "Yamada Sensei")
    private String createdByName;

    @Schema(description = "Lecturer Email", example = "lecturer@japanlearning.com")
    private String createdByEmail;

    @Schema(description = "Created timestamp", example = "2026-08-18T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp", example = "2026-08-18T10:00:00")
    private LocalDateTime updatedAt;
}
