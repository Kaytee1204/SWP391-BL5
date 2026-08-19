package com.example.base.service.deck.impl;

import com.example.base.dto.deck.DeckDtos.*;
import com.example.base.dto.vocabulary.VocabDtos.VocabItemDto;
import com.example.base.entity.*;
import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.repository.*;
import com.example.base.service.deck.PersonalDeckService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonalDeckServiceImpl implements PersonalDeckService {

    private final PersonalVocabularyDeckRepository vocabDeckRepository;
    private final PersonalVocabularyDeckItemRepository vocabItemRepository;
    private final PersonalKanjiDeckRepository kanjiDeckRepository;
    private final PersonalKanjiDeckItemRepository kanjiItemRepository;
    private final VocabularyItemRepository vocabularyRepository;
    private final KanjiDetailRepository kanjiRepository;
    private final AccountRepository accountRepository;

    @Override
    public List<PersonalVocabDeckDto> getVocabDecks(Long studentId) {
        requireStudent(studentId);
        return vocabDeckRepository.findByStudent_AccountIdOrderByCreatedAtDesc(studentId)
                .stream().map(this::toVocabDeckSummary).toList();
    }

    @Override
    public PersonalVocabDeckDto getVocabDeck(Long deckId, Long studentId) {
        PersonalVocabularyDeck deck = requireOwnedVocabDeck(deckId, studentId);
        List<VocabItemDto> items = vocabItemRepository.findByDeck_DeckIdOrderByAddedAtDesc(deckId)
                .stream().map(i -> toVocabItemDto(i.getVocabularyItem())).toList();
        PersonalVocabDeckDto result = toVocabDeckSummary(deck);
        result.setItems(items);
        return result;
    }

    @Override
    @Transactional
    public PersonalVocabDeckDto createVocabDeck(CreateDeckRequest request, Long studentId) {
        PersonalVocabularyDeck deck = PersonalVocabularyDeck.builder()
                .student(requireStudent(studentId))
                .title(request.getTitle().trim())
                .description(trimToNull(request.getDescription()))
                .build();
        return toVocabDeckSummary(vocabDeckRepository.save(deck));
    }

    @Override
    @Transactional
    public PersonalVocabDeckDto updateVocabDeck(Long deckId, CreateDeckRequest request, Long studentId) {
        PersonalVocabularyDeck deck = requireOwnedVocabDeck(deckId, studentId);
        deck.setTitle(request.getTitle().trim());
        deck.setDescription(trimToNull(request.getDescription()));
        return toVocabDeckSummary(vocabDeckRepository.save(deck));
    }

    @Override
    @Transactional
    public void deleteVocabDeck(Long deckId, Long studentId) {
        PersonalVocabularyDeck deck = requireOwnedVocabDeck(deckId, studentId);
        vocabItemRepository.deleteAll(vocabItemRepository.findByDeck_DeckIdOrderByAddedAtDesc(deckId));
        vocabDeckRepository.delete(deck);
    }

    @Override
    @Transactional
    public void addVocabItem(Long deckId, AddVocabToDeckRequest request, Long studentId) {
        PersonalVocabularyDeck deck = requireOwnedVocabDeck(deckId, studentId);
        VocabularyItem item = vocabularyRepository.findById(request.getVocabularyItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary item", "id", request.getVocabularyItemId()));
        PersonalVocabularyDeckItemId id = new PersonalVocabularyDeckItemId(deckId, item.getItemId());
        if (!vocabItemRepository.existsById(id)) {
            vocabItemRepository.save(PersonalVocabularyDeckItem.builder()
                    .id(id).deck(deck).vocabularyItem(item).build());
        }
    }

    @Override
    @Transactional
    public void removeVocabItem(Long deckId, Long itemId, Long studentId) {
        requireOwnedVocabDeck(deckId, studentId);
        PersonalVocabularyDeckItemId id = new PersonalVocabularyDeckItemId(deckId, itemId);
        if (!vocabItemRepository.existsById(id)) throw new ResourceNotFoundException("Vocabulary item is not in this deck");
        vocabItemRepository.deleteById(id);
    }

    @Override
    public List<PersonalKanjiDeckDto> getKanjiDecks(Long studentId) {
        requireStudent(studentId);
        return kanjiDeckRepository.findByStudent_AccountIdOrderByCreatedAtDesc(studentId)
                .stream().map(this::toKanjiDeckSummary).toList();
    }

    @Override
    public PersonalKanjiDeckDto getKanjiDeck(Long deckId, Long studentId) {
        PersonalKanjiDeck deck = requireOwnedKanjiDeck(deckId, studentId);
        List<PersonalKanjiDeckItemDto> items = kanjiItemRepository.findByDeck_DeckIdOrderByAddedAtDesc(deckId)
                .stream().map(this::toKanjiItemDto).toList();
        PersonalKanjiDeckDto result = toKanjiDeckSummary(deck);
        result.setItems(items);
        return result;
    }

    @Override
    @Transactional
    public PersonalKanjiDeckDto createKanjiDeck(CreateDeckRequest request, Long studentId) {
        PersonalKanjiDeck deck = PersonalKanjiDeck.builder()
                .student(requireStudent(studentId))
                .title(request.getTitle().trim())
                .description(trimToNull(request.getDescription()))
                .build();
        return toKanjiDeckSummary(kanjiDeckRepository.save(deck));
    }

    @Override
    @Transactional
    public PersonalKanjiDeckDto updateKanjiDeck(Long deckId, CreateDeckRequest request, Long studentId) {
        PersonalKanjiDeck deck = requireOwnedKanjiDeck(deckId, studentId);
        deck.setTitle(request.getTitle().trim());
        deck.setDescription(trimToNull(request.getDescription()));
        return toKanjiDeckSummary(kanjiDeckRepository.save(deck));
    }

    @Override
    @Transactional
    public void deleteKanjiDeck(Long deckId, Long studentId) {
        PersonalKanjiDeck deck = requireOwnedKanjiDeck(deckId, studentId);
        kanjiItemRepository.deleteAll(kanjiItemRepository.findByDeck_DeckIdOrderByAddedAtDesc(deckId));
        kanjiDeckRepository.delete(deck);
    }

    @Override
    @Transactional
    public void addKanji(Long deckId, AddKanjiToDeckRequest request, Long studentId) {
        PersonalKanjiDeck deck = requireOwnedKanjiDeck(deckId, studentId);
        KanjiDetail kanji = kanjiRepository.findById(request.getKanjiId())
                .orElseThrow(() -> new ResourceNotFoundException("Kanji", "id", request.getKanjiId()));
        PersonalKanjiDeckItemId id = new PersonalKanjiDeckItemId(deckId, kanji.getKanjiId());
        PersonalKanjiDeckItem item = kanjiItemRepository.findById(id)
                .orElseGet(() -> PersonalKanjiDeckItem.builder().id(id).deck(deck).kanji(kanji).build());
        item.setMemorizationNote(trimToNull(request.getMemorizationNote()));
        kanjiItemRepository.save(item);
    }

    @Override
    @Transactional
    public void updateKanjiNote(Long deckId, Long kanjiId, UpdateKanjiNoteRequest request, Long studentId) {
        requireOwnedKanjiDeck(deckId, studentId);
        PersonalKanjiDeckItem item = kanjiItemRepository.findById(new PersonalKanjiDeckItemId(deckId, kanjiId))
                .orElseThrow(() -> new ResourceNotFoundException("Kanji is not in this deck"));
        item.setMemorizationNote(trimToNull(request.getMemorizationNote()));
        kanjiItemRepository.save(item);
    }

    @Override
    @Transactional
    public void removeKanji(Long deckId, Long kanjiId, Long studentId) {
        requireOwnedKanjiDeck(deckId, studentId);
        PersonalKanjiDeckItemId id = new PersonalKanjiDeckItemId(deckId, kanjiId);
        if (!kanjiItemRepository.existsById(id)) throw new ResourceNotFoundException("Kanji is not in this deck");
        kanjiItemRepository.deleteById(id);
    }

    private Account requireStudent(Long id) {
        Account account = accountRepository.findByAccountIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));
        if (account.getRole() != Role.Student) throw new BadRequestException("Only students can own personal decks");
        return account;
    }

    private PersonalVocabularyDeck requireOwnedVocabDeck(Long deckId, Long studentId) {
        return vocabDeckRepository.findByDeckIdAndStudent_AccountId(deckId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary deck", "id", deckId));
    }

    private PersonalKanjiDeck requireOwnedKanjiDeck(Long deckId, Long studentId) {
        return kanjiDeckRepository.findByDeckIdAndStudent_AccountId(deckId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Kanji deck", "id", deckId));
    }

    private PersonalVocabDeckDto toVocabDeckSummary(PersonalVocabularyDeck deck) {
        return PersonalVocabDeckDto.builder()
                .deckId(deck.getDeckId()).studentId(deck.getStudent().getAccountId())
                .studentName(deck.getStudent().getFullName()).title(deck.getTitle())
                .description(deck.getDescription())
                .totalItems(Math.toIntExact(vocabItemRepository.countByDeck_DeckId(deck.getDeckId())))
                .createdAt(deck.getCreatedAt()).updatedAt(deck.getUpdatedAt()).build();
    }

    private PersonalKanjiDeckDto toKanjiDeckSummary(PersonalKanjiDeck deck) {
        return PersonalKanjiDeckDto.builder()
                .deckId(deck.getDeckId()).studentId(deck.getStudent().getAccountId())
                .studentName(deck.getStudent().getFullName()).title(deck.getTitle())
                .description(deck.getDescription())
                .totalItems(Math.toIntExact(kanjiItemRepository.countByDeck_DeckId(deck.getDeckId())))
                .createdAt(deck.getCreatedAt()).updatedAt(deck.getUpdatedAt()).build();
    }

    private PersonalKanjiDeckItemDto toKanjiItemDto(PersonalKanjiDeckItem item) {
        KanjiDetail kanji = item.getKanji();
        return PersonalKanjiDeckItemDto.builder()
                .kanjiId(kanji.getKanjiId()).moduleId(kanji.getModule().getModuleId())
                .moduleTitle(kanji.getModule().getTitle()).character(kanji.getCharacter())
                .onyomi(kanji.getOnyomi()).kunyomi(kanji.getKunyomi()).meaning(kanji.getMeaning())
                .compoundWords(kanji.getCompoundWords()).strokeOrderUrl(kanji.getStrokeOrderUrl())
                .jlptLevel(kanji.getModule().getJlptLevel())
                .memorizationNote(item.getMemorizationNote()).addedAt(item.getAddedAt()).build();
    }

    private VocabItemDto toVocabItemDto(VocabularyItem item) {
        return VocabItemDto.builder()
                .itemId(item.getItemId()).categoryId(item.getCategory().getCategoryId())
                .categoryName(item.getCategory().getName()).jlptLevel(item.getCategory().getJlptLevel())
                .word(item.getWord()).kanji(item.getKanji()).reading(item.getReading()).meaning(item.getMeaning())
                .audioUrl(item.getAudioUrl()).exampleSentence(item.getExampleSentence())
                .exampleTranslation(item.getExampleTranslation()).isPreview(item.isPreview())
                .createdAt(item.getCreatedAt()).updatedAt(item.getUpdatedAt()).build();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
