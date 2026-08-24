package com.example.base.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "FlashcardDeckItem")
@Getter
@Setter
public class FlashcardDeckItem {

    @EmbeddedId
    private FlashcardDeckItemId id;

    @MapsId("deckId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id")
    private FlashcardDeck flashcardDeck;

    @Column(name = "word", length = 50)
    private String word;

    @Column(name = "meaning", length = 50)
    private String meaning;

    @Column(name = "reading", length = 50)
    private String reading;
}