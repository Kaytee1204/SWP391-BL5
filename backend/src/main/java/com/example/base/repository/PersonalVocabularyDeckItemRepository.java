package com.example.base.repository;

import com.example.base.entity.PersonalVocabularyDeckItem;
import com.example.base.entity.PersonalVocabularyDeckItemId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Quản lý bảng liên kết nhiều-nhiều giữa deck và từ vựng. Repository dùng khóa ghép,
 * đồng thời cung cấp truy vấn danh sách và đếm item cho DTO chi tiết/tóm tắt.
 */
public interface PersonalVocabularyDeckItemRepository extends JpaRepository<PersonalVocabularyDeckItem, PersonalVocabularyDeckItemId> {
    List<PersonalVocabularyDeckItem> findByDeck_DeckIdOrderByAddedAtDesc(Long deckId);
    long countByDeck_DeckId(Long deckId);
}
