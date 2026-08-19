package com.example.base.service;

import com.example.base.dto.DeckDtos.*;

import java.util.List;

public interface PersonalDeckService {
    List<PersonalVocabDeckDto> getVocabDecks(Long studentId);
    PersonalVocabDeckDto getVocabDeck(Long deckId, Long studentId);
    PersonalVocabDeckDto createVocabDeck(CreateDeckRequest request, Long studentId);
    PersonalVocabDeckDto updateVocabDeck(Long deckId, CreateDeckRequest request, Long studentId);
    void deleteVocabDeck(Long deckId, Long studentId);
    void addVocabItem(Long deckId, AddVocabToDeckRequest request, Long studentId);
    void removeVocabItem(Long deckId, Long itemId, Long studentId);
    List<PersonalKanjiDeckDto> getKanjiDecks(Long studentId);
    PersonalKanjiDeckDto getKanjiDeck(Long deckId, Long studentId);
    PersonalKanjiDeckDto createKanjiDeck(CreateDeckRequest request, Long studentId);
    PersonalKanjiDeckDto updateKanjiDeck(Long deckId, CreateDeckRequest request, Long studentId);
    void deleteKanjiDeck(Long deckId, Long studentId);
    void addKanji(Long deckId, AddKanjiToDeckRequest request, Long studentId);
    void updateKanjiNote(Long deckId, Long kanjiId, UpdateKanjiNoteRequest request, Long studentId);
    void removeKanji(Long deckId, Long kanjiId, Long studentId);
}
