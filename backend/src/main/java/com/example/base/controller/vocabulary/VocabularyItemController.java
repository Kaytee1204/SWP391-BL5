package com.example.base.controller.vocabulary;

import com.example.base.dto.vocabulary.VocabDtos.*;
import com.example.base.dto.common.ApiResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import com.example.base.service.vocabulary.VocabularyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Điểm vào HTTP của màn 32-35 - quản lý mục từ vựng.
 * GET phục vụ cả màn học và màn quản lý; POST/PUT/DELETE chỉ dành cho Lecturer/Manager.
 * Controller chỉ nhận/validate request và lấy người thao tác từ JWT, còn chọn truy vấn,
 * kiểm tra quan hệ category và optimistic locking được giao cho {@link VocabularyService}.
 */
@RestController
@RequestMapping("/vocab-items")
@RequiredArgsConstructor
public class VocabularyItemController {
    private final VocabularyService vocabularyService;

    @GetMapping
    public ApiResponse<List<VocabItemDto>> getAll(@RequestParam(required = false) Long categoryId,
                                                  @RequestParam(required = false) JlptLevel jlptLevel,
                                                  @RequestParam(required = false) String search) {
        // Ba filter là tùy chọn; service quy định độ ưu tiên và trả DTO đã làm phẳng category/JLPT.
        return ApiResponse.success(vocabularyService.getItems(categoryId, jlptLevel, search));
    }

    @GetMapping("/{id}")
    public ApiResponse<VocabItemDto> getOne(@PathVariable Long id) {
        return ApiResponse.success(vocabularyService.getItem(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('Lecturer', 'Manager')")
    public ApiResponse<VocabItemDto> create(@Valid @RequestBody VocabItemRequest request,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        // Principal do JwtAuthenticationFilter nạp từ token; client không thể tự nhận là người tạo.
        return ApiResponse.success("Vocabulary item created successfully", vocabularyService.createItem(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Lecturer', 'Manager')")
    public ApiResponse<VocabItemDto> update(@PathVariable Long id, @Valid @RequestBody VocabItemRequest request,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        // Request mang version mà frontend đã đọc; service từ chối nếu database đã có bản mới hơn.
        return ApiResponse.success("Vocabulary item updated successfully", vocabularyService.updateItem(id, request, principal.getAccountId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Lecturer', 'Manager')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        // Service tìm entity trước khi xóa để ID không tồn tại trả 404 thay vì thành công giả.
        vocabularyService.deleteItem(id);
        return ApiResponse.success("Vocabulary item deleted successfully", null);
    }
}
