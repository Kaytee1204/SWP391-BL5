package com.example.base.mapper;

import com.example.base.dto.culture.CultureArticleCreateRequest;
import com.example.base.dto.culture.CultureArticleResponse;
import com.example.base.dto.culture.CultureArticleUpdateRequest;
import com.example.base.entity.Account;
import com.example.base.entity.CultureArticle;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CultureArticleMapper {

    public CultureArticle toEntity(CultureArticleCreateRequest request, Account author) {
        if (request == null) {
            return null;
        }

        String status = request.getStatus() != null && !request.getStatus().isBlank() 
                ? request.getStatus().trim().toLowerCase() 
                : "published";

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime publishedAt = "published".equalsIgnoreCase(status) ? now : null;

        return CultureArticle.builder()
                .title(request.getTitle() != null ? request.getTitle().trim() : null)
                .content(request.getContent() != null ? request.getContent().trim() : null)
                .coverImageUrl(request.getCoverImageUrl() != null ? request.getCoverImageUrl().trim() : null)
                .author(author)
                .status(status)
                .publishedAt(publishedAt)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public void updateEntityFromDto(CultureArticleUpdateRequest request, CultureArticle article) {
        if (request == null || article == null) {
            return;
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            article.setTitle(request.getTitle().trim());
        }
        if (request.getContent() != null && !request.getContent().isBlank()) {
            article.setContent(request.getContent().trim());
        }
        if (request.getCoverImageUrl() != null) {
            article.setCoverImageUrl(request.getCoverImageUrl().trim());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String newStatus = request.getStatus().trim().toLowerCase();
            if ("published".equalsIgnoreCase(newStatus) && !"published".equalsIgnoreCase(article.getStatus())) {
                article.setPublishedAt(LocalDateTime.now());
            } else if ("draft".equalsIgnoreCase(newStatus)) {
                article.setPublishedAt(null);
            }
            article.setStatus(newStatus);
        }
    }

    public CultureArticleResponse toResponse(CultureArticle article) {
        if (article == null) {
            return null;
        }

        Account author = article.getAuthor();

        return CultureArticleResponse.builder()
                .articleId(article.getArticleId())
                .title(article.getTitle())
                .content(article.getContent())
                .coverImageUrl(article.getCoverImageUrl())
                .status(article.getStatus())
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .authorId(author != null ? author.getAccountId() : null)
                .authorName(author != null ? author.getFullName() : "Unknown Author")
                .authorEmail(author != null ? author.getEmail() : null)
                .authorAvatarUrl(author != null ? author.getAvatarUrl() : null)
                .build();
    }
}
