package com.example.base.service.vocabulary;

import com.example.base.dto.vocabulary.VocabDtos.VocabItemDto;
import com.example.base.dto.vocabulary.VocabDtos.VocabItemRequest;
import com.example.base.entity.JlptLevel;

import java.util.List;

/**
 * Định nghĩa thao tác đọc/tìm kiếm và CRUD mục từ vựng. Controller chỉ phụ thuộc interface này,
 * nên không cần biết dữ liệu được lọc hay ánh xạ DTO như thế nào.
 */
public interface VocabularyService {
    List<VocabItemDto> getItems(Long categoryId, JlptLevel jlptLevel, String search);
    VocabItemDto getItem(Long itemId);
    VocabItemDto createItem(VocabItemRequest request, Long lecturerId);
    VocabItemDto updateItem(Long itemId, VocabItemRequest request, Long lecturerId);
    void deleteItem(Long itemId);
}
