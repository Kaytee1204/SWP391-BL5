package com.example.base.service;

import com.example.base.dto.KanjiDtos.*;
import com.example.base.entity.JlptLevel;

import java.util.List;

public interface KanjiService {
    List<KanjiModuleDto> getModules(JlptLevel jlptLevel);
    KanjiModuleDto getModule(Long moduleId);
    KanjiModuleDto createModule(KanjiModuleRequest request, Long creatorId);
    KanjiModuleDto updateModule(Long moduleId, KanjiModuleRequest request);
    void deleteModule(Long moduleId);
    List<KanjiDetailDto> getKanji(Long moduleId, JlptLevel jlptLevel, String search);
    KanjiDetailDto getKanji(Long kanjiId);
    KanjiDetailDto createKanji(KanjiDetailRequest request);
    KanjiDetailDto updateKanji(Long kanjiId, KanjiDetailRequest request);
    void deleteKanji(Long kanjiId);
}
