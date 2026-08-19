package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "PersonalKanjiDeckItem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalKanjiDeckItem {

    @EmbeddedId
    private PersonalKanjiDeckItemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("deckId")
    @JoinColumn(name = "deck_id", nullable = false)
    private PersonalKanjiDeck deck;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("kanjiId")
    @JoinColumn(name = "kanji_id", nullable = false)
    private KanjiDetail kanji;

    @Column(name = "memorization_note", length = 500)
    private String memorizationNote;

    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }
}
