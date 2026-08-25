package com.example.base.service.flashcard_deck.impl;

import com.example.base.dto.flashcard_deck.FlashcardDeckCreateRequest;
import com.example.base.dto.flashcard_deck.FlashcardDeckResponse;
import com.example.base.dto.flashcard_deck.FlashcardDeckUpdateRequest;
import com.example.base.entity.FlashcardDeck;
import com.example.base.mapper.FlashcardDeckMapper;
import com.example.base.repository.FlashcardDeckRepository;
import com.example.base.service.flashcard_deck.FlashcardDeckService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FlashcardDeckServiceImpl implements FlashcardDeckService {

    private final FlashcardDeckRepository repository;
    private final FlashcardDeckMapper mapper;

    @Override
    public FlashcardDeckResponse createDeck(FlashcardDeckCreateRequest request, Long lecturerId) {
        String title = request.getTitle().trim();
        if (repository.existsByTitleIgnoreCase(title)) {
            throw new IllegalArgumentException("System flashcard deck with this title already exists.");
        }

        FlashcardDeck entity = mapper.toEntity(request);
        entity.setTitle(title);
        entity.setDescription(normalizeDescription(request.getDescription()));
        entity.setCreatedBy(lecturerId);
        FlashcardDeck savedEntity = repository.save(entity);
        repository.flush();
        return mapper.toResponse(savedEntity);
    }

    @Override
    public FlashcardDeckResponse updateDeck(Long deckId, FlashcardDeckUpdateRequest request) {
        // 1. Tìm Entity cũ
        FlashcardDeck existingEntity = repository.findById(deckId)
                .orElseThrow(() -> new IllegalArgumentException("Flashcard deck not found."));

        // 2. Check trùng tên nếu tên bị thay đổi
        String title = request.getTitle().trim();
        if (!existingEntity.getTitle().equalsIgnoreCase(title) &&
            repository.existsByTitleIgnoreCase(title)) {
            throw new IllegalArgumentException("Title already in use by another deck.");
        }

        // 3. Update dữ liệu và lưu
        mapper.updateEntity(existingEntity, request);
        existingEntity.setTitle(title);
        existingEntity.setDescription(normalizeDescription(request.getDescription()));
        FlashcardDeck updatedEntity = repository.save(existingEntity);

        return mapper.toResponse(updatedEntity);
    }
    @Override
    public Page<FlashcardDeckResponse> getAllDecks(Pageable pageable) {

        Page<FlashcardDeck> pagedResult = repository.findAll(pageable);


        return pagedResult.map(mapper::toResponse);
    }
    @Override
    public void deleteDeck(Long deckId) {
        if (!repository.existsById(deckId)) {
            throw new IllegalArgumentException("Flashcard deck not found.");
        }
        repository.deleteById(deckId);
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }
        String trimmed = description.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
