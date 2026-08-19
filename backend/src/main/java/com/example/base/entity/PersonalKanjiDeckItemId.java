package com.example.base.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PersonalKanjiDeckItemId implements Serializable {

    @Column(name = "deck_id")
    private Long deckId;

    @Column(name = "kanji_id")
    private Long kanjiId;

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof PersonalKanjiDeckItemId that)) return false;
        return Objects.equals(deckId, that.deckId) && Objects.equals(kanjiId, that.kanjiId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(deckId, kanjiId);
    }
}
