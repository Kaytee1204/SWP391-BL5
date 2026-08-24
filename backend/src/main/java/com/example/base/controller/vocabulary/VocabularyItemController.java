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
 * REST API của mục từ vựng. Cho phép Lecturer, Student, Manager thực hiện CRUD.
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
        // Principal duoc JwtAuthenticationFilter nap tu token, khong lay Lecturer tu request.
        return ApiResponse.success("Vocabulary item created successfully", vocabularyService.createItem(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Lecturer', 'Manager')")
    public ApiResponse<VocabItemDto> update(@PathVariable Long id, @Valid @RequestBody VocabItemRequest request,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Vocabulary item updated successfully", vocabularyService.updateItem(id, request, principal.getAccountId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Lecturer', 'Manager')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        vocabularyService.deleteItem(id);
        return ApiResponse.success("Vocabulary item deleted successfully", null);
    }
}
