package com.example.base.repository;

import com.example.base.entity.PersonalVocabularyDeckItem;
import com.example.base.entity.PersonalVocabularyDeckItemId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PersonalVocabularyDeckItemRepository extends JpaRepository<PersonalVocabularyDeckItem, PersonalVocabularyDeckItemId> {
    List<PersonalVocabularyDeckItem> findByDeck_DeckIdOrderByAddedAtDesc(Long deckId);
    long countByDeck_DeckId(Long deckId);
}
