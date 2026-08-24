package com.example.base.service.materials;

import com.example.base.dto.kanji.KanjiDtos.KanjiDetailDto;
import com.example.base.dto.kanji.KanjiDtos.KanjiDetailRequest;
import com.example.base.dto.kanji.KanjiDtos.KanjiModuleDto;
import com.example.base.dto.kanji.KanjiDtos.KanjiModuleRequest;
import com.example.base.dto.vocabulary.VocabDtos.VocabItemDto;
import com.example.base.dto.vocabulary.VocabDtos.VocabItemRequest;
import com.example.base.entity.*;
import com.example.base.repository.*;
import com.example.base.service.kanji.impl.KanjiServiceImpl;
import com.example.base.service.vocabulary.impl.VocabularyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LearningMaterialAuditServiceTest {
    private final KanjiLessonModuleRepository moduleRepository = mock(KanjiLessonModuleRepository.class);
    private final KanjiDetailRepository kanjiRepository = mock(KanjiDetailRepository.class);
    private final VocabularyCategoryRepository categoryRepository = mock(VocabularyCategoryRepository.class);
    private final VocabularyItemRepository itemRepository = mock(VocabularyItemRepository.class);
    private final AccountRepository accountRepository = mock(AccountRepository.class);
    private final PersonalKanjiDeckItemRepository deckItemRepository = mock(PersonalKanjiDeckItemRepository.class);

    private KanjiServiceImpl kanjiService;
    private VocabularyServiceImpl vocabularyService;
    private Account lecturerA;
    private Account lecturerB;
    private KanjiLessonModule module;
    private VocabularyCategory category;

    @BeforeEach
    void setUp() {
        reset(moduleRepository, kanjiRepository, categoryRepository, itemRepository, accountRepository, deckItemRepository);
        kanjiService = new KanjiServiceImpl(moduleRepository, kanjiRepository, accountRepository, deckItemRepository);
        vocabularyService = new VocabularyServiceImpl(categoryRepository, itemRepository, accountRepository);
        lecturerA = Account.builder().accountId(1L).fullName("Lecturer A").role(Role.Lecturer).build();
        lecturerB = Account.builder().accountId(2L).fullName("Lecturer B").role(Role.Lecturer).build();
        module = KanjiLessonModule.builder().moduleId(10L).title("N5").jlptLevel(JlptLevel.N5)
                .createdBy(lecturerA).updatedBy(lecturerA).version(1L).build();
        category = VocabularyCategory.builder().categoryId(20L).name("School").jlptLevel(JlptLevel.N5).createdBy(lecturerB).build();
        when(accountRepository.findByAccountIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(lecturerA));
        when(accountRepository.findByAccountIdAndDeletedAtIsNull(2L)).thenReturn(Optional.of(lecturerB));
        when(moduleRepository.findById(10L)).thenReturn(Optional.of(module));
        when(categoryRepository.findById(20L)).thenReturn(Optional.of(category));
    }

    @Test
    void lecturerACreatesKanjiAndBecomesBothCreatorAndUpdater() {
        when(kanjiRepository.saveAndFlush(any())).thenAnswer(invocation -> {
            KanjiDetail saved = invocation.getArgument(0);
            saved.setKanjiId(100L);
            saved.setVersion(0L);
            saved.setCreatedAt(LocalDateTime.now());
            saved.setUpdatedAt(saved.getCreatedAt());
            return saved;
        });

        KanjiDetailDto result = kanjiService.createKanji(kanjiRequest(null), lecturerA.getAccountId());

        assertEquals("Lecturer A", result.getCreatedBy());
        assertEquals("Lecturer A", result.getUpdatedBy());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
    }

    @Test
    void lecturerBEditsLecturerAKanjiModuleWithoutChangingCreator() {
        when(moduleRepository.saveAndFlush(module)).thenAnswer(invocation -> {
            module.setVersion(2L);
            return module;
        });

        KanjiModuleDto result = kanjiService.updateModule(10L,
                new KanjiModuleRequest(JlptLevel.N4, "Updated module", null, 1L), lecturerB.getAccountId());

        assertEquals("Lecturer A", result.getCreatedByName());
        assertEquals("Lecturer B", result.getUpdatedByName());
        assertSame(lecturerA, module.getCreatedBy());
    }

    @Test
    void staleKanjiModuleVersionIsRejectedBeforeOverwrite() {
        assertThrows(ObjectOptimisticLockingFailureException.class,
                () -> kanjiService.updateModule(10L,
                        new KanjiModuleRequest(JlptLevel.N4, "Stale update", null, 0L), lecturerB.getAccountId()));

        verify(moduleRepository, never()).saveAndFlush(any(KanjiLessonModule.class));
    }

    @Test
    void lecturerBEditsLecturerAKanjiWithoutChangingCreator() {
        KanjiDetail existing = kanjiEntity(lecturerA, 1L);
        when(kanjiRepository.findById(100L)).thenReturn(Optional.of(existing));
        when(kanjiRepository.saveAndFlush(existing)).thenAnswer(invocation -> { existing.setVersion(2L); return existing; });

        KanjiDetailDto result = kanjiService.updateKanji(100L, kanjiRequest(1L), lecturerB.getAccountId());

        assertEquals("Lecturer A", result.getCreatedBy());
        assertEquals("Lecturer B", result.getUpdatedBy());
        assertSame(lecturerA, existing.getCreatedBy());
    }

    @Test
    void lecturerAEditsLecturerBVocabularyWithoutChangingCreator() {
        VocabularyItem existing = vocabularyEntity(lecturerB, 3L);
        when(itemRepository.findById(200L)).thenReturn(Optional.of(existing));
        when(itemRepository.saveAndFlush(existing)).thenAnswer(invocation -> { existing.setVersion(4L); return existing; });

        VocabItemDto result = vocabularyService.updateItem(200L, vocabRequest(3L), lecturerA.getAccountId());

        assertEquals("Lecturer B", result.getCreatedBy());
        assertEquals("Lecturer A", result.getUpdatedBy());
        assertSame(lecturerB, existing.getCreatedBy());
    }

    @Test
    void staleKanjiAndVocabularyVersionsAreRejectedBeforeOverwrite() {
        when(kanjiRepository.findById(100L)).thenReturn(Optional.of(kanjiEntity(lecturerA, 2L)));
        when(itemRepository.findById(200L)).thenReturn(Optional.of(vocabularyEntity(lecturerB, 4L)));

        assertThrows(ObjectOptimisticLockingFailureException.class,
                () -> kanjiService.updateKanji(100L, kanjiRequest(1L), lecturerB.getAccountId()));
        assertThrows(ObjectOptimisticLockingFailureException.class,
                () -> vocabularyService.updateItem(200L, vocabRequest(3L), lecturerA.getAccountId()));
        verify(kanjiRepository, never()).saveAndFlush(any());
        verify(itemRepository, never()).saveAndFlush(any());
    }

    private KanjiDetailRequest kanjiRequest(Long version) {
        return new KanjiDetailRequest(10L, "日", "ニチ", "ひ", "sun", null, version);
    }

    private VocabItemRequest vocabRequest(Long version) {
        return new VocabItemRequest(20L, "がくせい", "学生", "gakusei", "student", null, null, version);
    }

    private KanjiDetail kanjiEntity(Account creator, Long version) {
        return KanjiDetail.builder().kanjiId(100L).module(module).character("日").meaning("sun")
                .createdBy(creator).updatedBy(creator).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .version(version).build();
    }

    private VocabularyItem vocabularyEntity(Account creator, Long version) {
        return VocabularyItem.builder().itemId(200L).category(category).word("がくせい").reading("gakusei").meaning("student")
                .createdBy(creator).updatedBy(creator).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .version(version).build();
    }
}
