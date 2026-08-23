package com.example.base.dto.flashcard_deck;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FlashcardDeckItemCreateRequest {
    @NotNull(message = "Deck ID is required.")
    private Long deckId;

    @NotBlank(message = "Item type is required.")
    @Pattern(regexp = "^(vocabulary|kanji)$", message = "Item type must be either 'vocabulary' or 'kanji'.")
    private String itemType;

    private Long itemId;

    @NotBlank(message = "Word is required.")
    @Size(max = 50, message = "Word must not exceed 50 characters.")
    private String word;

    @NotBlank(message = "Meaning is required.")
    @Size(max = 50, message = "Meaning must not exceed 50 characters.")
    private String meaning;

    @Size(max = 50, message = "Reading must not exceed 50 characters.")
    private String reading;
}