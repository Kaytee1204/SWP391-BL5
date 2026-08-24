package com.example.base.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
/** Khoa ghep xac dinh duy nhat mot muc tu vung trong mot deck ca nhan. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PersonalVocabularyDeckItemId implements Serializable {

    @Column(name = "deck_id")
    private Long deckId;

    @Column(name = "vocabulary_item_id")
    private Long vocabularyItemId;

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof PersonalVocabularyDeckItemId that)) return false;
        return Objects.equals(deckId, that.deckId) && Objects.equals(vocabularyItemId, that.vocabularyItemId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(deckId, vocabularyItemId);
    }
}
