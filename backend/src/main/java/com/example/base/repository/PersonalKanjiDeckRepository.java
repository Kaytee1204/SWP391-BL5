package com.example.base.repository;

import com.example.base.entity.PersonalKanjiDeck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PersonalKanjiDeckRepository extends JpaRepository<PersonalKanjiDeck, Long> {
    // Lay tat ca personal kanji deck cua student, sap xep deck moi tao len truoc.
    List<PersonalKanjiDeck> findByStudent_AccountIdOrderByCreatedAtDesc(Long studentId);
    // Tim deck theo id va owner, dung de dam bao student chi thao tac deck cua chinh minh.
    Optional<PersonalKanjiDeck> findByDeckIdAndStudent_AccountId(Long deckId, Long studentId);
}
