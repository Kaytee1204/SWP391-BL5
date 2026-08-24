package com.example.base.service.vocabulary_category;

import java.util.List;

import com.example.base.dto.vocabulary_category.VocabularyCategoryCreateRequest;
import com.example.base.dto.vocabulary_category.VocabularyCategoryResponse;
import com.example.base.dto.vocabulary_category.VocabularyCategoryUpdateRequest;
import com.example.base.entity.JlptLevel;

/** Hợp đồng CRUD category; creatorId tách khỏi request vì phải lấy từ user đã xác thực. */
public interface VocabularyCategoryService {
    List<VocabularyCategoryResponse> getAllCategories(JlptLevel jlptLevel);
    VocabularyCategoryResponse getCategoryById(Long id);
    VocabularyCategoryResponse createCategory(VocabularyCategoryCreateRequest request, Long creatorId);
    VocabularyCategoryResponse updateCategory(Long id, VocabularyCategoryUpdateRequest request);
    void deleteCategory(Long id);
}
