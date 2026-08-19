package com.example.base.service.deck;

import com.example.base.dto.deck.DeckDtos.*;

import java.util.List;

public interface PersonalDeckService {
    List<PersonalVocabDeckDto> getVocabDecks(Long studentId);
    PersonalVocabDeckDto getVocabDeck(Long deckId, Long studentId);
    PersonalVocabDeckDto createVocabDeck(CreateDeckRequest request, Long studentId);
    PersonalVocabDeckDto updateVocabDeck(Long deckId, CreateDeckRequest request, Long studentId);
    void deleteVocabDeck(Long deckId, Long studentId);
    void addVocabItem(Long deckId, AddVocabToDeckRequest request, Long studentId);
    void removeVocabItem(Long deckId, Long itemId, Long studentId);
    // Lay tat ca personal kanji deck cua student.
    List<PersonalKanjiDeckDto> getKanjiDecks(Long studentId);
    // Lay chi tiet mot personal kanji deck kem danh sach item.
    PersonalKanjiDeckDto getKanjiDeck(Long deckId, Long studentId);
    // Tao personal kanji deck moi cho student.
    PersonalKanjiDeckDto createKanjiDeck(CreateDeckRequest request, Long studentId);
    // Cap nhat title/description cua personal kanji deck.
    PersonalKanjiDeckDto updateKanjiDeck(Long deckId, CreateDeckRequest request, Long studentId);
    // Xoa personal kanji deck va cac item ben trong.
    void deleteKanjiDeck(Long deckId, Long studentId);
    // Them kanji vao deck hoac cap nhat note neu item da ton tai.
    void addKanji(Long deckId, AddKanjiToDeckRequest request, Long studentId);
    // Cap nhat memorization note cua kanji trong deck.
    void updateKanjiNote(Long deckId, Long kanjiId, UpdateKanjiNoteRequest request, Long studentId);
    // Xoa kanji item khoi personal kanji deck.
    void removeKanji(Long deckId, Long kanjiId, Long studentId);
}
