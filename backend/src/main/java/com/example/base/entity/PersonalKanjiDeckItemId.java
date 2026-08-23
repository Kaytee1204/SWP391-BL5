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
/**
 * Khóa ghép của bảng PersonalKanjiDeckItem. Serializable, equals và hashCode là bắt buộc
 * để JPA nhận diện cùng một cặp deck-Kanji trong persistence context và khi gọi findById.
 */
public class PersonalKanjiDeckItemId implements Serializable {

    @Column(name = "deck_id")
    private Long deckId;

    @Column(name = "kanji_id")
    private Long kanjiId;

    @Override
    public boolean equals(Object other) {
        // Hai khóa chỉ bằng nhau khi cả deckId và kanjiId đều bằng nhau.
        if (this == other) return true;
        if (!(other instanceof PersonalKanjiDeckItemId that)) return false;
        return Objects.equals(deckId, that.deckId) && Objects.equals(kanjiId, that.kanjiId);
    }

    @Override
    public int hashCode() {
        // hashCode phải dùng cùng hai trường với equals để collection và JPA hoạt động đúng.
        return Objects.hash(deckId, kanjiId);
    }
}
