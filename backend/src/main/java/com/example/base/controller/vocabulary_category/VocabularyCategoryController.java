package com.example.base.controller.vocabulary_category;

import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.vocabulary_category.VocabularyCategoryCreateRequest;
import com.example.base.dto.vocabulary_category.VocabularyCategoryResponse;
import com.example.base.dto.vocabulary_category.VocabularyCategoryUpdateRequest;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import com.example.base.service.vocabulary_category.VocabularyCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST API quản lý category từ vựng. GET phục vụ cơ chế xem học liệu hiện tại;
 * các endpoint ghi có @PreAuthorize nên chỉ Lecturer vượt qua trước khi gọi service.
 */
@RestController
@RequestMapping("/vocabulary-categories")
@RequiredArgsConstructor
public class VocabularyCategoryController {

    private final VocabularyCategoryService service;

    @GetMapping
    public ApiResponse<List<VocabularyCategoryResponse>> getAll(@RequestParam(required = false) JlptLevel jlptLevel) {
        // Không truyền jlptLevel nghĩa là lấy tất cả; enum hợp lệ được Spring chuyển từ query string.
        return ApiResponse.success(service.getAllCategories(jlptLevel));
    }

    @GetMapping("/{id}")
    public ApiResponse<VocabularyCategoryResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(service.getCategoryById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer')")
    public ApiResponse<VocabularyCategoryResponse> create(@Valid @RequestBody VocabularyCategoryCreateRequest request,
                                                           @AuthenticationPrincipal UserPrincipal principal) {
        // Người tạo lấy từ principal thay vì tin một account ID do client gửi lên.
        return ApiResponse.success("Category created successfully", service.createCategory(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer')")
    public ApiResponse<VocabularyCategoryResponse> update(@PathVariable Long id,
                                                           @Valid @RequestBody VocabularyCategoryUpdateRequest request) {
        return ApiResponse.success("Category updated successfully", service.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.deleteCategory(id);
        return ApiResponse.success("Category deleted successfully", null);
    }
}
