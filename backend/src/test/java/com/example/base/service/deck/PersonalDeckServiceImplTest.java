package com.example.base.service.deck;

import com.example.base.dto.deck.DeckDtos.AddKanjiToDeckRequest;
import com.example.base.dto.deck.DeckDtos.PersonalKanjiDeckDto;
import com.example.base.entity.Account;
import com.example.base.entity.KanjiDetail;
import com.example.base.entity.PersonalKanjiDeck;
import com.example.base.entity.PersonalKanjiDeckItem;
import com.example.base.entity.PersonalKanjiDeckItemId;
import com.example.base.entity.Role;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.KanjiDetailRepository;
import com.example.base.repository.PersonalKanjiDeckItemRepository;
import com.example.base.repository.PersonalKanjiDeckRepository;
import com.example.base.repository.PersonalVocabularyDeckItemRepository;
import com.example.base.repository.PersonalVocabularyDeckRepository;
import com.example.base.repository.VocabularyItemRepository;
import com.example.base.service.deck.impl.PersonalDeckServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PersonalDeckServiceImplTest {

    @Mock private PersonalVocabularyDeckRepository vocabDeckRepository;
    @Mock private PersonalVocabularyDeckItemRepository vocabItemRepository;
    @Mock private PersonalKanjiDeckRepository kanjiDeckRepository;
    @Mock private PersonalKanjiDeckItemRepository kanjiItemRepository;
    @Mock private VocabularyItemRepository vocabularyRepository;
    @Mock private KanjiDetailRepository kanjiRepository;
    @Mock private AccountRepository accountRepository;

    @InjectMocks
    private PersonalDeckServiceImpl service;

    @Test
    void getKanjiDeckRejectsDeckOwnedByAnotherStudent() {
        when(kanjiDeckRepository.findByDeckIdAndStudent_AccountId(10L, 2L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getKanjiDeck(10L, 2L));
    }

    @Test
    void addKanjiUsesOwnedDeckAndPersistsTheCompositeKey() {
        Account student = Account.builder().accountId(2L).role(Role.Student).fullName("Student").build();
        PersonalKanjiDeck deck = PersonalKanjiDeck.builder().deckId(10L).student(student).title("N5").build();
        KanjiDetail kanji = KanjiDetail.builder().kanjiId(20L).character("日").build();
        AddKanjiToDeckRequest request = new AddKanjiToDeckRequest(20L, "  mặt trời  ");
        PersonalKanjiDeckItemId expectedId = new PersonalKanjiDeckItemId(10L, 20L);

        when(kanjiDeckRepository.findByDeckIdAndStudent_AccountId(10L, 2L)).thenReturn(Optional.of(deck));
        when(kanjiRepository.findById(20L)).thenReturn(Optional.of(kanji));
        when(kanjiItemRepository.findById(expectedId)).thenReturn(Optional.empty());

        service.addKanji(10L, request, 2L);

        ArgumentCaptor<PersonalKanjiDeckItem> captor = ArgumentCaptor.forClass(PersonalKanjiDeckItem.class);
        verify(kanjiItemRepository).save(captor.capture());
        assertEquals(expectedId, captor.getValue().getId());
        assertEquals(deck, captor.getValue().getDeck());
        assertEquals(kanji, captor.getValue().getKanji());
        assertEquals("mặt trời", captor.getValue().getMemorizationNote());
    }

    @Test
    void getKanjiDeckSummaryCountsOnlyItemsInThatDeck() {
        Account student = Account.builder().accountId(2L).role(Role.Student).fullName("Student").build();
        PersonalKanjiDeck deck = PersonalKanjiDeck.builder().deckId(10L).student(student).title("N5").build();

        when(kanjiDeckRepository.findByDeckIdAndStudent_AccountId(10L, 2L)).thenReturn(Optional.of(deck));
        when(kanjiItemRepository.findByDeck_DeckIdOrderByAddedAtDesc(10L)).thenReturn(java.util.List.of());
        when(kanjiItemRepository.countByDeck_DeckId(10L)).thenReturn(0L);

        PersonalKanjiDeckDto result = service.getKanjiDeck(10L, 2L);

        assertEquals(10L, result.getDeckId());
        assertEquals(2L, result.getStudentId());
        assertEquals(0, result.getTotalItems());
        assertEquals(java.util.List.of(), result.getItems());
    }
}
