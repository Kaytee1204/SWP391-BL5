package com.example.base.dto.reading_passage.response;



import com.example.base.entity.JlptLevel;
import com.fasterxml.jackson.annotation.JsonProperty;
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
@Schema(description = "Reading passage response")
public class ReadingPassageResponse {
    private Long passageId;
    private JlptLevel jlptLevel;
    private String title;
    private String contentHtml;
    private String translation;

    @JsonProperty("isPreview")
    private Boolean isPreview;

    private Long createdById;
    private String createdByName;
    private String createdByEmail;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

}
