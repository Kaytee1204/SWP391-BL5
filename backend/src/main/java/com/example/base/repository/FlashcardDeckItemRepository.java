package com.example.base.repository;

import com.example.base.entity.FlashcardDeckItem;
import com.example.base.entity.FlashcardDeckItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface FlashcardDeckItemRepository extends JpaRepository<FlashcardDeckItem, FlashcardDeckItemId> {
    List<FlashcardDeckItem> findById_DeckId(Long deckId);
    @Transactional
    void deleteById_DeckId(Long deckId);
}