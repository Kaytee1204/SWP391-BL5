package com.example.base.service;

import java.util.List;

import com.example.base.dto.request.VocabularyCategoryCreateRequest;
import com.example.base.dto.request.VocabularyCategoryUpdateRequest;
import com.example.base.dto.response.VocabularyCategoryResponse;

public interface VocabularyCategoryService {
    List<VocabularyCategoryResponse> getAllCategories();
    VocabularyCategoryResponse getCategoryById(Long id);
    VocabularyCategoryResponse createCategory(VocabularyCategoryCreateRequest request);
    VocabularyCategoryResponse updateCategory(Long id, VocabularyCategoryUpdateRequest request);
    void deleteCategory(Long id);
}