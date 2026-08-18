package com.example.base.service.impl;

import com.example.base.dto.request.VocabularyCategoryCreateRequest;
import com.example.base.dto.request.VocabularyCategoryUpdateRequest;
import com.example.base.dto.response.VocabularyCategoryResponse;
import com.example.base.entity.Account;
import com.example.base.entity.VocabularyCategory;
import com.example.base.mapper.VocabularyCategoryMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.VocabularyCategoryRepository;
import com.example.base.service.VocabularyCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VocabularyCategoryServiceImpl implements VocabularyCategoryService {

    private final VocabularyCategoryRepository repository;
    private final AccountRepository accountRepository;
    private final VocabularyCategoryMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<VocabularyCategoryResponse> getAllCategories() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VocabularyCategoryResponse getCategoryById(Long id) {
        VocabularyCategory category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return mapper.toResponse(category);
    }

    @Override
    @Transactional
    public VocabularyCategoryResponse createCategory(VocabularyCategoryCreateRequest request) {
        VocabularyCategory entity = mapper.toEntity(request);
        
        // Lấy Account người tạo
        Account createdBy = accountRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new RuntimeException("Lecturer Account not found with id: " + request.getCreatedById()));
        
        entity.setCreatedBy(createdBy);

        VocabularyCategory savedEntity = repository.save(entity);
        return mapper.toResponse(savedEntity);
    }

    @Override
    @Transactional
    public VocabularyCategoryResponse updateCategory(Long id, VocabularyCategoryUpdateRequest request) {
        VocabularyCategory existingCategory = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Cập nhật thông tin
        existingCategory.setJlptLevel(request.getJlptLevel());
        existingCategory.setName(request.getName());
        existingCategory.setDescription(request.getDescription());
        
        VocabularyCategory updatedEntity = repository.save(existingCategory);
        return mapper.toResponse(updatedEntity);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Category not found with id: " + id);
        }
        repository.deleteById(id);
    }
}