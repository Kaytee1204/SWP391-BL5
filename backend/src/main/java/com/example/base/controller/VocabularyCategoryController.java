package com.example.base.controller;

import com.example.base.dto.VocabDtos.*;
import com.example.base.dto.response.ApiResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import com.example.base.service.VocabularyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vocab-categories")
@RequiredArgsConstructor
public class VocabularyCategoryController {
    private final VocabularyService vocabularyService;

    @GetMapping
    public ApiResponse<List<VocabCategoryDto>> getAll(@RequestParam(required = false) JlptLevel jlptLevel) {
        return ApiResponse.success(vocabularyService.getCategories(jlptLevel));
    }

    @GetMapping("/{id}")
    public ApiResponse<VocabCategoryDto> getOne(@PathVariable Long id) {
        return ApiResponse.success(vocabularyService.getCategory(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('Manager','Lecturer','Author')")
    public ApiResponse<VocabCategoryDto> create(@Valid @RequestBody VocabCategoryRequest request,
                                                @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Vocabulary category created successfully",
                vocabularyService.createCategory(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Manager','Lecturer','Author')")
    public ApiResponse<VocabCategoryDto> update(@PathVariable Long id, @Valid @RequestBody VocabCategoryRequest request) {
        return ApiResponse.success("Vocabulary category updated successfully", vocabularyService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Manager','Lecturer','Author')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        vocabularyService.deleteCategory(id);
        return ApiResponse.success("Vocabulary category deleted successfully", null);
    }
}
