package com.example.base;

import com.example.base.dto.deck.DeckDtos.AddKanjiToDeckRequest;
import com.example.base.dto.deck.DeckDtos.CreateDeckRequest;
import com.example.base.dto.deck.DeckDtos.PersonalKanjiDeckDto;
import com.example.base.dto.kanji.KanjiDtos.KanjiDetailDto;
import com.example.base.dto.kanji.KanjiDtos.KanjiDetailRequest;
import com.example.base.dto.kanji.KanjiDtos.KanjiModuleDto;
import com.example.base.dto.kanji.KanjiDtos.KanjiModuleRequest;
import com.example.base.entity.Account;
import com.example.base.entity.AccountStatus;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.Role;
import com.example.base.repository.AccountRepository;
import com.example.base.service.deck.PersonalDeckService;
import com.example.base.service.kanji.KanjiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class SqlServerKanjiFlowIntegrationTest {

    @Autowired private AccountRepository accountRepository;
    @Autowired private KanjiService kanjiService;
    @Autowired private PersonalDeckService deckService;

    @Test
    @Transactional
    void kanjiCanFlowFromDatabaseToPersonalDeckDto() {
        String testRun = UUID.randomUUID().toString();
        Account author = saveAccount("author-" + testRun + "@sqlserver.test", "Tác giả", Role.Author);
        Account student = saveAccount("student-" + testRun + "@sqlserver.test", "Học viên", Role.Student);

        KanjiModuleDto module = kanjiService.createModule(
                new KanjiModuleRequest(JlptLevel.N5, "Kanji cơ bản", "Bài kiểm tra SQL Server"),
                author.getAccountId());
        KanjiDetailDto kanji = kanjiService.createKanji(new KanjiDetailRequest(
                module.getModuleId(), "日", "ニチ", "ひ", "https://example.test/nichi.gif",
                "Nhật, mặt trời", "日本", true));
        PersonalKanjiDeckDto deck = deckService.createKanjiDeck(
                new CreateDeckRequest("N5 của tôi", "Deck kiểm tra"), student.getAccountId());

        deckService.addKanji(deck.getDeckId(),
                new AddKanjiToDeckRequest(kanji.getKanjiId(), "Mặt trời có một nét ngang"),
                student.getAccountId());

        PersonalKanjiDeckDto loaded = deckService.getKanjiDeck(deck.getDeckId(), student.getAccountId());
        assertEquals(1, loaded.getTotalItems());
        assertEquals("日", loaded.getItems().get(0).getCharacter());
        assertEquals("Kanji cơ bản", loaded.getItems().get(0).getModuleTitle());
        assertEquals("https://example.test/nichi.gif", loaded.getItems().get(0).getStrokeOrderUrl());
        assertNotNull(loaded.getItems().get(0).getAddedAt());
    }

    private Account saveAccount(String email, String fullName, Role role) {
        return accountRepository.save(Account.builder()
                .email(email)
                .passwordHash("not-used-in-this-test")
                .fullName(fullName)
                .role(role)
                .jlptTargetLevel(JlptLevel.N5)
                .status(AccountStatus.active)
                .build());
    }
}
