package com.example.base.repository;

import com.example.base.entity.PersonalVocabularyDeck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Truy cập personal vocabulary deck. Ghép deckId với studentId là lớp bảo vệ ownership,
 * tránh trường hợp người dùng đoán ID để đọc hoặc sửa deck của người khác.
 */
public interface PersonalVocabularyDeckRepository extends JpaRepository<PersonalVocabularyDeck, Long> {
    List<PersonalVocabularyDeck> findByStudent_AccountIdOrderByCreatedAtDesc(Long studentId);
    Optional<PersonalVocabularyDeck> findByDeckIdAndStudent_AccountId(Long deckId, Long studentId);
}
