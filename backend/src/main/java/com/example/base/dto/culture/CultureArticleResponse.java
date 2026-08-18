package com.example.base.dto.culture;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CultureArticleResponse {

    private Long articleId;
    private String title;
    private String content;
    private String coverImageUrl;
    private String status;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long authorId;
    private String authorName;
    private String authorEmail;
    private String authorAvatarUrl;
}
