package com.example.base.service.flashcard_deck;

import com.example.base.dto.flashcard_deck.FlashcardDeckCreateRequest;
import com.example.base.dto.flashcard_deck.FlashcardDeckResponse;
import com.example.base.dto.flashcard_deck.FlashcardDeckUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FlashcardDeckService {
    FlashcardDeckResponse createDeck(FlashcardDeckCreateRequest request, Long lecturerId);
    FlashcardDeckResponse updateDeck(Long deckId, FlashcardDeckUpdateRequest request);
    void deleteDeck(Long deckId);
    Page<FlashcardDeckResponse> getAllDecks(Pageable pageable);
}