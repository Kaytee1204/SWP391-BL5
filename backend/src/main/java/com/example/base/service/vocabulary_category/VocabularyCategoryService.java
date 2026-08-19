package com.example.base.service.vocabulary_category;

import java.util.List;

import com.example.base.dto.vocabulary_category.VocabularyCategoryCreateRequest;
import com.example.base.dto.vocabulary_category.VocabularyCategoryResponse;
import com.example.base.dto.vocabulary_category.VocabularyCategoryUpdateRequest;

public interface VocabularyCategoryService {
    List<VocabularyCategoryResponse> getAllCategories();
    VocabularyCategoryResponse getCategoryById(Long id);
    VocabularyCategoryResponse createCategory(VocabularyCategoryCreateRequest request);
    VocabularyCategoryResponse updateCategory(Long id, VocabularyCategoryUpdateRequest request);
    void deleteCategory(Long id);
}