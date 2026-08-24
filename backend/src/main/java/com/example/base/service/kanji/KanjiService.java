package com.example.base.service.kanji;

import com.example.base.dto.kanji.KanjiDtos.*;
import com.example.base.entity.JlptLevel;

import java.util.List;

/** Tách nghiệp vụ Kanji khỏi HTTP controller và chi tiết truy vấn của repository. */
public interface KanjiService {
    // Lấy module, có thể lọc theo JLPT; null mang nghĩa lấy tất cả.
    List<KanjiModuleDto> getModules(JlptLevel jlptLevel);
    // Lay chi tiet mot kanji module theo id.
    KanjiModuleDto getModule(Long moduleId);
    // Tao kanji module moi va gan nguoi tao theo creatorId.
    KanjiModuleDto createModule(KanjiModuleRequest request, Long creatorId);
    // Cap nhat thong tin kanji module theo id.
    KanjiModuleDto updateModule(Long moduleId, KanjiModuleRequest request, Long lecturerId);
    // Xóa module chỉ khi không có Kanji con đang được personal deck tham chiếu.
    void deleteModule(Long moduleId);
    // Lấy Kanji theo module/JLPT/keyword; implementation quyết định độ ưu tiên của các filter.
    List<KanjiDetailDto> getKanji(Long moduleId, JlptLevel jlptLevel, String search);
    // Lay chi tiet mot chu kanji theo id.
    KanjiDetailDto getKanji(Long kanjiId);
    // Tao moi mot kanji detail trong module.
    KanjiDetailDto createKanji(KanjiDetailRequest request, Long lecturerId);
    // Cap nhat thong tin mot kanji detail theo id.
    KanjiDetailDto updateKanji(Long kanjiId, KanjiDetailRequest request, Long lecturerId);
    // Xoa kanji detail neu chua duoc luu trong personal deck.
    void deleteKanji(Long kanjiId);
}
