package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Bảng nối giữa deck cá nhân và VocabularyItem dùng chung.
 * Xóa item khỏi deck chỉ xóa bản ghi nối này, tuyệt đối không xóa mục từ nguồn của Lecturer.
 */
@Entity
@Table(name = "PersonalVocabularyDeckItem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalVocabularyDeckItem {

    @EmbeddedId
    // Khóa ghép (deckId, vocabularyItemId) ngăn một từ xuất hiện hai lần trong cùng deck.
    private PersonalVocabularyDeckItemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("deckId")
    // @MapsId nói rằng khóa ngoại deck_id cũng là một phần của khóa chính nhúng.
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
        // addedAt phục vụ thứ tự "mới thêm trước" trên màn chi tiết deck.
        addedAt = LocalDateTime.now();
    }
}
