package com.example.base.repository;

import com.example.base.entity.PersonalVocabularyDeck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PersonalVocabularyDeckRepository extends JpaRepository<PersonalVocabularyDeck, Long> {
    List<PersonalVocabularyDeck> findByStudent_AccountIdOrderByCreatedAtDesc(Long studentId);
    Optional<PersonalVocabularyDeck> findByDeckIdAndStudent_AccountId(Long deckId, Long studentId);
}
