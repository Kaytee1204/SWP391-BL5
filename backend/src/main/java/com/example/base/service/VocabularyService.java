package com.example.base.service;

import com.example.base.dto.VocabDtos.*;
import com.example.base.entity.JlptLevel;

import java.util.List;

public interface VocabularyService {
    List<VocabCategoryDto> getCategories(JlptLevel jlptLevel);
    VocabCategoryDto getCategory(Long categoryId);
    VocabCategoryDto createCategory(VocabCategoryRequest request, Long creatorId);
    VocabCategoryDto updateCategory(Long categoryId, VocabCategoryRequest request);
    void deleteCategory(Long categoryId);
    List<VocabItemDto> getItems(Long categoryId, JlptLevel jlptLevel, String search);
    VocabItemDto getItem(Long itemId);
    VocabItemDto createItem(VocabItemRequest request);
    VocabItemDto updateItem(Long itemId, VocabItemRequest request);
    void deleteItem(Long itemId);
}
