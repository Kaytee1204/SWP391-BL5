package com.example.base.service.vocabulary.impl;

import com.example.base.dto.vocabulary.VocabDtos.VocabItemDto;
import com.example.base.dto.vocabulary.VocabDtos.VocabItemRequest;
import com.example.base.entity.*;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.repository.*;
import com.example.base.service.vocabulary.VocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/**
 * Thực thi nghiệp vụ mục từ vựng: chọn truy vấn theo filter, chuẩn hóa input,
 * kiểm tra category/item tồn tại và chuyển entity thành DTO cho frontend.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VocabularyServiceImpl implements VocabularyService {

    private final VocabularyCategoryRepository categoryRepository;
    private final VocabularyItemRepository itemRepository;
    private final AccountRepository accountRepository;

    @Override
    public List<VocabItemDto> getItems(Long categoryId, JlptLevel level, String search) {
        List<VocabularyItem> result;
        // Search được ưu tiên cao nhất. Khi có keyword, repository tìm trên word/kanji/reading/meaning.
        if (search != null && !search.isBlank()) {
            result = itemRepository.search(search.trim());
        } else if (categoryId != null) {
            // categoryId cụ thể hơn JLPT nên được xét trước level.
            result = itemRepository.findByCategory_CategoryIdOrderByItemIdAsc(categoryId);
        } else if (level != null) {
            result = itemRepository.findByJlptLevel(level);
        } else {
            // Không có điều kiện thì trả toàn bộ; cuối cùng mọi nhánh đều map về cùng một DTO.
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
    public VocabItemDto createItem(VocabItemRequest request, Long lecturerId) {
        // lecturerId den tu UserPrincipal cua JWT, khong den tu form nen client khong the chon nguoi tao.
        Account lecturer = requireAccount(lecturerId);
        // requireCategory biến categoryId từ JSON thành entity thật và chặn khóa ngoại không hợp lệ.
        VocabularyItem item = VocabularyItem.builder()
                .category(requireCategory(request.getCategoryId()))
                .word(request.getWord().trim())
                .kanji(trimToNull(request.getKanji()))
                .reading(request.getReading().trim())
                .meaning(request.getMeaning().trim())
                .exampleSentence(request.getExampleSentence())
                .exampleTranslation(request.getExampleTranslation())
                .createdBy(lecturer)
                .updatedBy(lecturer)
                .build();
        return toItemDto(itemRepository.saveAndFlush(item));
    }

    @Override
    @Transactional
    public VocabItemDto updateItem(Long itemId, VocabItemRequest request, Long lecturerId) {
        // Nạp entity đang được quản lý, thay các field cho phép sửa rồi save; ID/timestamp không lấy từ client.
        VocabularyItem item = requireItem(itemId);
        requireCurrentVersion(request.getVersion(), item.getVersion(), itemId);
        item.setCategory(requireCategory(request.getCategoryId()));
        item.setWord(request.getWord().trim());
        item.setKanji(trimToNull(request.getKanji()));
        item.setReading(request.getReading().trim());
        item.setMeaning(request.getMeaning().trim());
        item.setExampleSentence(request.getExampleSentence());
        item.setExampleTranslation(request.getExampleTranslation());
        // Edit dua tren role o controller, khong dua tren createdBy; createdBy vi the luon duoc giu nguyen.
        item.setUpdatedBy(requireAccount(lecturerId));
        return toItemDto(itemRepository.saveAndFlush(item));
    }

    @Override
    @Transactional
    public void deleteItem(Long itemId) {
        itemRepository.delete(requireItem(itemId));
    }

    private VocabularyCategory requireCategory(Long id) {
        // Gom xử lý 404 vào helper để create/update có cùng hành vi khi category không tồn tại.
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary category", "id", id));
    }

    private VocabularyItem requireItem(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary item", "id", id));
    }

    private Account requireAccount(Long id) {
        return accountRepository.findByAccountIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));
    }

    private void requireCurrentVersion(Long requestedVersion, Long currentVersion, Long id) {
        // Client gui version da mo; @Version tiep tuc bao ve neu DB doi sau check nhung truoc luc flush.
        if (requestedVersion == null || !Objects.equals(requestedVersion, currentVersion)) {
            throw new ObjectOptimisticLockingFailureException(VocabularyItem.class, id);
        }
    }

    public VocabItemDto toItemDto(VocabularyItem item) {
        // Làm phẳng dữ liệu category để frontend không cần truy cập cấu trúc entity lồng nhau.
        return VocabItemDto.builder()
                .itemId(item.getItemId())
                .categoryId(item.getCategory().getCategoryId())
                .categoryName(item.getCategory().getName())
                .jlptLevel(item.getCategory().getJlptLevel())
                .word(item.getWord())
                .kanji(item.getKanji())
                .reading(item.getReading())
                .meaning(item.getMeaning())
                .exampleSentence(item.getExampleSentence())
                .exampleTranslation(item.getExampleTranslation())
                .createdBy(item.getCreatedBy().getFullName())
                .updatedBy(item.getUpdatedBy().getFullName())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .version(item.getVersion())
                .build();
    }

    private String trimToNull(String value) {
        // Kanji là tùy chọn; lưu null thay vì chuỗi rỗng giúp query và hiển thị nhất quán hơn.
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
