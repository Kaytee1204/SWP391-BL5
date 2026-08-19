package com.example.base.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.vocabulary_category.VocabularyCategoryCreateRequest;
import com.example.base.dto.vocabulary_category.VocabularyCategoryResponse;
import com.example.base.dto.vocabulary_category.VocabularyCategoryUpdateRequest;
import com.example.base.service.VocabularyCategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/vocabulary-categories")
@RequiredArgsConstructor
public class VocabularyCategoryController {

    private final VocabularyCategoryService service;

    @GetMapping
    public ApiResponse<List<VocabularyCategoryResponse>> getAll() {
        return ApiResponse.<List<VocabularyCategoryResponse>>builder()
                .code(200)
                .message("Success")
                .data(service.getAllCategories()) // Sửa thành tên trường tương ứng trong ApiResponse của bạn (ví dụ: data hoặc result)
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<VocabularyCategoryResponse> getById(@PathVariable Long id) {
        return ApiResponse.<VocabularyCategoryResponse>builder()
                .code(200)
                .message("Success")
                .data(service.getCategoryById(id))
                .build();
    }

    @PostMapping
    public ApiResponse<VocabularyCategoryResponse> create(@Valid @RequestBody VocabularyCategoryCreateRequest request) {
        return ApiResponse.<VocabularyCategoryResponse>builder()
                .code(201)
                .message("Category created successfully")
                .data(service.createCategory(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<VocabularyCategoryResponse> update(@PathVariable Long id, @Valid @RequestBody VocabularyCategoryUpdateRequest request) {
        return ApiResponse.<VocabularyCategoryResponse>builder()
                .code(200)
                .message("Category updated successfully")
                .data(service.updateCategory(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.deleteCategory(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Category deleted successfully")
                .build();
    }
}