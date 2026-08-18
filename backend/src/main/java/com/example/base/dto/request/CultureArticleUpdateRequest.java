package com.example.base.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CultureArticleUpdateRequest {

    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    private String content;

    @Size(max = 500, message = "Cover image URL cannot exceed 500 characters")
    private String coverImageUrl;

    private String status; // "published" or "draft"
}
