package com.example.base.controller;

import com.example.base.dto.VocabDtos.*;
import com.example.base.dto.response.ApiResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.service.VocabularyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @PreAuthorize("hasAnyRole('Manager','Lecturer','Author')")
    public ApiResponse<VocabItemDto> create(@Valid @RequestBody VocabItemRequest request) {
        return ApiResponse.success("Vocabulary item created successfully", vocabularyService.createItem(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Manager','Lecturer','Author')")
    public ApiResponse<VocabItemDto> update(@PathVariable Long id, @Valid @RequestBody VocabItemRequest request) {
        return ApiResponse.success("Vocabulary item updated successfully", vocabularyService.updateItem(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Manager','Lecturer','Author')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        vocabularyService.deleteItem(id);
        return ApiResponse.success("Vocabulary item deleted successfully", null);
    }
}
