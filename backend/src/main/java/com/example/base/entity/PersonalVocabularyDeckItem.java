package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "PersonalVocabularyDeckItem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalVocabularyDeckItem {

    @EmbeddedId
    private PersonalVocabularyDeckItemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("deckId")
    @JoinColumn(name = "deck_id", nullable = false)
    private PersonalVocabularyDeck deck;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("vocabularyItemId")
    @JoinColumn(name = "vocabulary_item_id", nullable = false)
    private VocabularyItem vocabularyItem;

    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }
}
