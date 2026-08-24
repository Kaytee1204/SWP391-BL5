package com.example.base.dto.reading_passage.request;

import com.example.base.entity.JlptLevel;
import com.fasterxml.jackson.annotation.JsonProperty;
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
@Schema(description = "Request for updating a reading passage")
public class ReadingPassageUpdateRequest {
    private JlptLevel jlptLevel;

    @Size(max = 200, message = "Title must no exceed 200 characters")
    private String title;

    private String contentHtml;

    private String translation;

    @JsonProperty("isPreview")
    private Boolean isPreview;
}
