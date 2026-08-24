package com.example.base.dto.flashcard_deck;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FlashcardDeckItemResponse {
    private Long deckId;
    private String itemType;
    private Long itemId;
    private String word;
    private String meaning;
    private String reading;
}