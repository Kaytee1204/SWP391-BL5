package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "FlashcardDeckItem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardDeckItem {

    @EmbeddedId
    private FlashcardDeckItemId id;


    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("deckId")
    @JoinColumn(name = "deck_id", insertable = false, updatable = false)
    private FlashcardDeck flashcardDeck;
}