package com.example.base.service.kanji;

import com.example.base.dto.kanji.KanjiDtos.*;
import com.example.base.entity.JlptLevel;

import java.util.List;

public interface KanjiService {
    // Lay danh sach kanji module, co the loc theo JLPT level.
    List<KanjiModuleDto> getModules(JlptLevel jlptLevel);
    // Lay chi tiet mot kanji module theo id.
    KanjiModuleDto getModule(Long moduleId);
    // Tao kanji module moi va gan nguoi tao theo creatorId.
    KanjiModuleDto createModule(KanjiModuleRequest request, Long creatorId);
    // Cap nhat thong tin kanji module theo id.
    KanjiModuleDto updateModule(Long moduleId, KanjiModuleRequest request);
    // Xoa kanji module neu khong bi rang buoc boi personal deck.
    void deleteModule(Long moduleId);
    // Lay danh sach kanji detail, co the loc theo module, JLPT level, hoac search keyword.
    List<KanjiDetailDto> getKanji(Long moduleId, JlptLevel jlptLevel, String search);
    // Lay chi tiet mot chu kanji theo id.
    KanjiDetailDto getKanji(Long kanjiId);
    // Tao moi mot kanji detail trong module.
    KanjiDetailDto createKanji(KanjiDetailRequest request);
    // Cap nhat thong tin mot kanji detail theo id.
    KanjiDetailDto updateKanji(Long kanjiId, KanjiDetailRequest request);
    // Xoa kanji detail neu chua duoc luu trong personal deck.
    void deleteKanji(Long kanjiId);
}
