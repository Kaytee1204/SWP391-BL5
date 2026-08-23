package com.example.base.service.kanji;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.KanjiDetail;
import com.example.base.entity.KanjiLessonModule;
import com.example.base.exception.BadRequestException;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.KanjiDetailRepository;
import com.example.base.repository.KanjiLessonModuleRepository;
import com.example.base.repository.PersonalKanjiDeckItemRepository;
import com.example.base.service.kanji.impl.KanjiServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
/**
 * Kiểm tra hai nhánh dễ gây sai dữ liệu trong KanjiService: giữ bộ lọc module khi tìm kiếm
 * và không xóa Kanji đang được Personal Deck tham chiếu. Repository được mock để quan sát
 * chính xác service đã chọn câu truy vấn hoặc thao tác lưu/xóa nào.
 */
class KanjiServiceImplTest {

    @Mock private KanjiLessonModuleRepository moduleRepository;
    @Mock private KanjiDetailRepository kanjiRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private PersonalKanjiDeckItemRepository kanjiDeckItemRepository;

    @InjectMocks
    private KanjiServiceImpl service;

    @Test
    void searchKeepsTheSelectedModuleFilter() {
        // Khi có cả moduleId, JLPT và từ khóa, module cụ thể có độ ưu tiên cao nhất.
        // Từ khóa được trim trước khi chuyển xuống repository để kết quả tìm kiếm ổn định.
        KanjiLessonModule module = KanjiLessonModule.builder().moduleId(10L).build();
        when(moduleRepository.findById(10L)).thenReturn(Optional.of(module));
        when(kanjiRepository.searchByModule(10L, "日")).thenReturn(List.of());

        assertEquals(List.of(), service.getKanji(10L, JlptLevel.N5, " 日 "));

        verify(kanjiRepository).searchByModule(10L, "日");
        verify(kanjiRepository, never()).search("日");
    }

    @Test
    void deleteKanjiIsBlockedWhileItIsUsedByAPersonalDeck() {
        // Xóa Kanji gốc khi bảng deck_item còn tham chiếu sẽ làm hỏng deck hoặc vi phạm
        // khóa ngoại. Service phải dừng trước khi repository.delete được thực thi.
        KanjiDetail kanji = KanjiDetail.builder().kanjiId(20L).build();
        when(kanjiRepository.findById(20L)).thenReturn(Optional.of(kanji));
        when(kanjiDeckItemRepository.existsByKanji_KanjiId(20L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> service.deleteKanji(20L));

        verify(kanjiRepository, never()).delete(kanji);
    }
}
