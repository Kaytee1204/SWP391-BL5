package com.example.base.service.vocabulary_category.impl;

import com.example.base.dto.vocabulary_category.VocabularyCategoryCreateRequest;
import com.example.base.dto.vocabulary_category.VocabularyCategoryResponse;
import com.example.base.dto.vocabulary_category.VocabularyCategoryUpdateRequest;
import com.example.base.entity.Account;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.VocabularyCategory;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.VocabularyCategoryMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.VocabularyCategoryRepository;
import com.example.base.repository.VocabularyItemRepository;
import com.example.base.service.vocabulary_category.VocabularyCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Xử lý category từ vựng. Service chọn repository theo JLPT, gắn người tạo từ tài khoản
 * đăng nhập, chuẩn hóa chuỗi và bổ sung itemCount trước khi trả response.
 */
@Service
@RequiredArgsConstructor
public class VocabularyCategoryServiceImpl implements VocabularyCategoryService {

    private final VocabularyCategoryRepository repository;
    private final AccountRepository accountRepository;
    private final VocabularyItemRepository vocabularyItemRepository;
    private final VocabularyCategoryMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<VocabularyCategoryResponse> getAllCategories(JlptLevel jlptLevel) {
        // null nghĩa là "tất cả"; có level thì đẩy điều kiện xuống database thay vì lọc trong Java.
        List<VocabularyCategory> categories = jlptLevel == null
                ? repository.findByOrderByCategoryIdAsc()
                : repository.findByJlptLevelOrderByCategoryIdAsc(jlptLevel);
        return categories.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VocabularyCategoryResponse getCategoryById(Long id) {
        return toResponse(getCategory(id));
    }

    @Override
    @Transactional
    public VocabularyCategoryResponse createCategory(VocabularyCategoryCreateRequest request, Long creatorId) {
        // creatorId do controller lấy từ JWT, không tin createdById do frontend tự gửi.
        Account creator = accountRepository.findByAccountIdAndDeletedAtIsNull(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", creatorId));
        VocabularyCategory category = mapper.toEntity(request);
        category.setName(request.getName().trim());
        category.setCreatedBy(creator);
        return toResponse(repository.save(category));
    }

    @Override
    @Transactional
    public VocabularyCategoryResponse updateCategory(Long id, VocabularyCategoryUpdateRequest request) {
        // Chỉ cập nhật các field nghiệp vụ được cho phép; creator và createdAt vẫn giữ nguyên.
        VocabularyCategory category = getCategory(id);
        category.setJlptLevel(request.getJlptLevel());
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        return toResponse(repository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        // Entity khai báo cascade tới VocabularyItem, nên xóa category sẽ lan xuống các item con.
        repository.delete(getCategory(id));
    }

    private VocabularyCategory getCategory(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary category", "id", id));
    }

    private VocabularyCategoryResponse toResponse(VocabularyCategory category) {
        // Mapper xử lý field trực tiếp; service bổ sung số lượng item bằng count query nhẹ.
        VocabularyCategoryResponse response = mapper.toResponse(category);
        response.setCreatedByName(category.getCreatedBy() != null ? category.getCreatedBy().getFullName() : null);
        response.setItemCount(Math.toIntExact(vocabularyItemRepository.countByCategory_CategoryId(category.getCategoryId())));
        return response;
    }
}
