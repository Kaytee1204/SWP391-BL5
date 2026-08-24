package com.example.base.service.flashcard_deck;

import com.example.base.dto.flashcard_deck.FlashcardDeckItemCreateRequest;
import com.example.base.dto.flashcard_deck.FlashcardDeckItemResponse;
import java.util.List;

public interface FlashcardDeckItemService {
    List<FlashcardDeckItemResponse> getItemsByDeckId(Long deckId);
    FlashcardDeckItemResponse addItemToDeck(FlashcardDeckItemCreateRequest request);
    FlashcardDeckItemResponse updateItemInDeck(FlashcardDeckItemCreateRequest request); // Thêm hàm cập nhật thẻ con
    void removeItemFromDeck(Long deckId, String itemType, Long itemId);
}