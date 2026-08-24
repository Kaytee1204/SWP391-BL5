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
/**
 * Bảng liên kết giữa personal Kanji deck và Kanji gốc. Ngoài quan hệ nhiều-nhiều,
 * bản ghi này còn giữ ghi chú ghi nhớ riêng của học viên và thời điểm thêm vào deck.
 */
public class PersonalKanjiDeckItem {

    @EmbeddedId
    // Khóa chính gồm (deckId, kanjiId), vì một Kanji chỉ được xuất hiện một lần trong cùng deck.
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
        // Khi them kanji vao deck, tu dong gan addedAt bang thoi diem item duoc persist.
        addedAt = LocalDateTime.now();
    }
}
