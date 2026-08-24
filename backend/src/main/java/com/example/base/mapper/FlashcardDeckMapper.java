package com.example.base.mapper;

import com.example.base.entity.FlashcardDeck;
import com.example.base.dto.flashcard_deck.FlashcardDeckCreateRequest;
import com.example.base.dto.flashcard_deck.FlashcardDeckResponse;
import com.example.base.dto.flashcard_deck.FlashcardDeckUpdateRequest;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class FlashcardDeckMapper {

    public FlashcardDeck toEntity(FlashcardDeckCreateRequest request) {
        if (request == null) {
            return null;
        }
        FlashcardDeck deck = new FlashcardDeck();
        deck.setTitle(request.getTitle());
        deck.setDescription(request.getDescription());
        return deck;
    }

    public void updateEntity(FlashcardDeck entity, FlashcardDeckUpdateRequest request) {
        if (request == null || entity == null) {
            return;
        }
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            entity.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
    }

    public FlashcardDeckResponse toResponse(FlashcardDeck entity) {
        if (entity == null) {
            return null;
        }
        return FlashcardDeckResponse.builder()
                .deckId(entity.getDeckId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .createdBy(entity.getCreatedBy())
                .items(entity.getItems() != null ? entity.getItems().stream()
                        .map(item -> {
                            Map<String, Object> map = new HashMap<>();
                            if (item.getId() != null) {
                                map.put("deckId", item.getId().getDeckId());
                                map.put("itemType", item.getId().getItemType());
                                map.put("itemId", item.getId().getItemId());
                            }
                            return map;
                        })
                        .collect(Collectors.toList()) : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}