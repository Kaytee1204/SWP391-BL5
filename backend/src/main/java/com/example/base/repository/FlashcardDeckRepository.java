package com.example.base.repository;

import com.example.base.entity.FlashcardDeck;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, Long> {
    boolean existsByTitle(String title);
    Page<FlashcardDeck> findAll(Pageable pageable);
}