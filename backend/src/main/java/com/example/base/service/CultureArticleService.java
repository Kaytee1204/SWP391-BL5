package com.example.base.service;

import com.example.base.dto.request.CultureArticleCreateRequest;
import com.example.base.dto.request.CultureArticleUpdateRequest;
import com.example.base.dto.response.CultureArticleResponse;
import com.example.base.dto.response.PageResponse;
import com.example.base.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface CultureArticleService {

    PageResponse<CultureArticleResponse> searchArticles(String keyword, String status, Pageable pageable);

    PageResponse<CultureArticleResponse> searchMyArticles(String keyword, String status, UserPrincipal currentUser, Pageable pageable);

    CultureArticleResponse getArticleById(Long articleId);

    CultureArticleResponse createArticle(CultureArticleCreateRequest request, UserPrincipal currentUser);

    CultureArticleResponse updateArticle(Long articleId, CultureArticleUpdateRequest request, UserPrincipal currentUser);

    void deleteArticle(Long articleId, UserPrincipal currentUser);
}
