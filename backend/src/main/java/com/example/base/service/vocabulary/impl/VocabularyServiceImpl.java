package com.example.base.service.vocabulary.impl;

import com.example.base.dto.vocabulary.VocabDtos.*;
import com.example.base.entity.*;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.repository.*;
import com.example.base.service.vocabulary.VocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VocabularyServiceImpl implements VocabularyService {

    private final VocabularyCategoryRepository categoryRepository;
    private final VocabularyItemRepository itemRepository;
    private final AccountRepository accountRepository;

    @Override
    public List<VocabCategoryDto> getCategories(JlptLevel level) {
        List<VocabularyCategory> categories = level == null
                ? categoryRepository.findByOrderByCategoryIdAsc()
                : categoryRepository.findByJlptLevelOrderByCategoryIdAsc(level);
        return categories.stream().map(this::toCategoryDto).toList();
    }

    @Override
    public VocabCategoryDto getCategory(Long categoryId) {
        return toCategoryDto(requireCategory(categoryId));
    }

    @Override
    @Transactional
    public VocabCategoryDto createCategory(VocabCategoryRequest request, Long creatorId) {
        Account creator = accountRepository.findByAccountIdAndDeletedAtIsNull(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", creatorId));
        VocabularyCategory category = VocabularyCategory.builder()
                .jlptLevel(request.getJlptLevel())
                .name(request.getName().trim())
                .description(request.getDescription())
                .createdBy(creator)
                .build();
        return toCategoryDto(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public VocabCategoryDto updateCategory(Long categoryId, VocabCategoryRequest request) {
        VocabularyCategory category = requireCategory(categoryId);
        category.setJlptLevel(request.getJlptLevel());
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        return toCategoryDto(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long categoryId) {
        categoryRepository.delete(requireCategory(categoryId));
    }

    @Override
    public List<VocabItemDto> getItems(Long categoryId, JlptLevel level, String search) {
        List<VocabularyItem> result;
        if (search != null && !search.isBlank()) {
            result = itemRepository.search(search.trim());
        } else if (categoryId != null) {
            result = itemRepository.findByCategory_CategoryIdOrderByItemIdAsc(categoryId);
        } else if (level != null) {
            result = itemRepository.findByJlptLevel(level);
        } else {
            result = itemRepository.findAll();
        }
        return result.stream().map(this::toItemDto).toList();
    }

    @Override
    public VocabItemDto getItem(Long itemId) {
        return toItemDto(requireItem(itemId));
    }

    @Override
    @Transactional
    public VocabItemDto createItem(VocabItemRequest request) {
        VocabularyItem item = VocabularyItem.builder()
                .category(requireCategory(request.getCategoryId()))
                .word(request.getWord().trim())
                .kanji(trimToNull(request.getKanji()))
                .reading(request.getReading().trim())
                .meaning(request.getMeaning().trim())
                .audioUrl(request.getAudioUrl())
                .exampleSentence(request.getExampleSentence())
                .exampleTranslation(request.getExampleTranslation())
                .isPreview(Boolean.TRUE.equals(request.getIsPreview()))
                .build();
        return toItemDto(itemRepository.save(item));
    }

    @Override
    @Transactional
    public VocabItemDto updateItem(Long itemId, VocabItemRequest request) {
        VocabularyItem item = requireItem(itemId);
        item.setCategory(requireCategory(request.getCategoryId()));
        item.setWord(request.getWord().trim());
        item.setKanji(trimToNull(request.getKanji()));
        item.setReading(request.getReading().trim());
        item.setMeaning(request.getMeaning().trim());
        item.setAudioUrl(request.getAudioUrl());
        item.setExampleSentence(request.getExampleSentence());
        item.setExampleTranslation(request.getExampleTranslation());
        if (request.getIsPreview() != null) item.setPreview(request.getIsPreview());
        return toItemDto(itemRepository.save(item));
    }

    @Override
    @Transactional
    public void deleteItem(Long itemId) {
        itemRepository.delete(requireItem(itemId));
    }

    private VocabularyCategory requireCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary category", "id", id));
    }

    private VocabularyItem requireItem(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary item", "id", id));
    }

    private VocabCategoryDto toCategoryDto(VocabularyCategory category) {
        return VocabCategoryDto.builder()
                .categoryId(category.getCategoryId())
                .jlptLevel(category.getJlptLevel())
                .name(category.getName())
                .description(category.getDescription())
                .createdById(category.getCreatedBy().getAccountId())
                .createdByName(category.getCreatedBy().getFullName())
                .itemCount(Math.toIntExact(itemRepository.countByCategory_CategoryId(category.getCategoryId())))
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    public VocabItemDto toItemDto(VocabularyItem item) {
        return VocabItemDto.builder()
                .itemId(item.getItemId())
                .categoryId(item.getCategory().getCategoryId())
                .categoryName(item.getCategory().getName())
                .jlptLevel(item.getCategory().getJlptLevel())
                .word(item.getWord())
                .kanji(item.getKanji())
                .reading(item.getReading())
                .meaning(item.getMeaning())
                .audioUrl(item.getAudioUrl())
                .exampleSentence(item.getExampleSentence())
                .exampleTranslation(item.getExampleTranslation())
                .isPreview(item.isPreview())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
