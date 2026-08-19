package com.example.base.repository;

import com.example.base.entity.PersonalKanjiDeck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PersonalKanjiDeckRepository extends JpaRepository<PersonalKanjiDeck, Long> {
    List<PersonalKanjiDeck> findByStudent_AccountIdOrderByCreatedAtDesc(Long studentId);
    Optional<PersonalKanjiDeck> findByDeckIdAndStudent_AccountId(Long deckId, Long studentId);
}
