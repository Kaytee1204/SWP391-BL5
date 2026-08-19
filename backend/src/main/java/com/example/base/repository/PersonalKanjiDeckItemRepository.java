package com.example.base.repository;

import com.example.base.entity.PersonalKanjiDeckItem;
import com.example.base.entity.PersonalKanjiDeckItemId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PersonalKanjiDeckItemRepository extends JpaRepository<PersonalKanjiDeckItem, PersonalKanjiDeckItemId> {
    // Lay tat ca kanji item trong deck, item moi them hien truoc.
    List<PersonalKanjiDeckItem> findByDeck_DeckIdOrderByAddedAtDesc(Long deckId);
    // Dem so kanji item trong deck, dung de tinh totalItems.
    long countByDeck_DeckId(Long deckId);
    // Kiem tra kanji co dang duoc luu trong bat ky personal deck nao khong.
    boolean existsByKanji_KanjiId(Long kanjiId);
    // Kiem tra module co kanji nao dang duoc luu trong personal deck khong.
    boolean existsByKanji_Module_ModuleId(Long moduleId);
}
