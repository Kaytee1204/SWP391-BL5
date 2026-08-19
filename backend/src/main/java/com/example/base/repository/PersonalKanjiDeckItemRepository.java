package com.example.base.repository;

import com.example.base.entity.PersonalKanjiDeckItem;
import com.example.base.entity.PersonalKanjiDeckItemId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PersonalKanjiDeckItemRepository extends JpaRepository<PersonalKanjiDeckItem, PersonalKanjiDeckItemId> {
    List<PersonalKanjiDeckItem> findByDeck_DeckIdOrderByAddedAtDesc(Long deckId);
    long countByDeck_DeckId(Long deckId);
}
