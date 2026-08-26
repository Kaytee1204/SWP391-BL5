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
/**
 * Kiểm thử tích hợp toàn bộ luồng Kanji trên database thật: tài khoản -> module -> Kanji
 * -> Personal Deck -> DTO trả về. Khác unit test dùng mock, test này phát hiện lỗi mapping
 * JPA, khóa ngoại hoặc truy vấn chỉ xuất hiện khi các bảng thực sự làm việc cùng nhau.
 */
class SqlServerKanjiFlowIntegrationTest {

    @Autowired private AccountRepository accountRepository;
    @Autowired private KanjiService kanjiService;
    @Autowired private PersonalDeckService deckService;

    @Test
    @Transactional
    void kanjiCanFlowFromDatabaseToPersonalDeckDto() {
        // UUID giúp email không trùng giữa nhiều lần chạy. @Transactional rollback toàn bộ
        // dữ liệu test sau khi kết thúc, nên database không bị tích lũy bản ghi thử nghiệm.
        String testRun = UUID.randomUUID().toString();
        Account author = saveAccount("author-" + testRun + "@sqlserver.test", "Tác giả", Role.Author);
        Account student = saveAccount("student-" + testRun + "@sqlserver.test", "Học viên", Role.Student);

        // Tạo dữ liệu theo đúng thứ tự phụ thuộc khóa ngoại, sau đó thêm Kanji vào deck
        // bằng các service công khai giống luồng controller sẽ gọi trong ứng dụng.
        KanjiModuleDto module = kanjiService.createModule(
                new KanjiModuleRequest(JlptLevel.N5, "Kanji cơ bản", "Bài kiểm tra SQL Server", null),
                author.getAccountId());
        KanjiDetailDto kanji = kanjiService.createKanji(new KanjiDetailRequest(
                module.getModuleId(), "日", "ニチ", "ひ", "Nhật, mặt trời", "日本", null),
                author.getAccountId());
        PersonalKanjiDeckDto deck = deckService.createKanjiDeck(
                new CreateDeckRequest("N5 của tôi", "Deck kiểm tra"), student.getAccountId());

        deckService.addKanji(deck.getDeckId(),
                new AddKanjiToDeckRequest(kanji.getKanjiId(), "Mặt trời có một nét ngang"),
                student.getAccountId());

        // Đọc lại từ database thay vì kiểm tra object vừa tạo, để xác nhận entity đã được
        // lưu và mapper đã đưa character, moduleTitle, addedAt vào DTO chi tiết chính xác.
        PersonalKanjiDeckDto loaded = deckService.getKanjiDeck(deck.getDeckId(), student.getAccountId());
        assertEquals(1, loaded.getTotalItems());
        assertEquals("日", loaded.getItems().get(0).getCharacter());
        assertEquals("Kanji cơ bản", loaded.getItems().get(0).getModuleTitle());
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
