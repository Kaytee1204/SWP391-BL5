package com.example.base.dto.flashcard_deck;

import org.springframework.cglib.core.Local;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalDateTime;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardDeckResponse {

    private Long deckId;
    private String title;
    private String description;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
