package com.example.base.service.kanji.impl;

import com.example.base.dto.kanji.KanjiDtos.*;
import com.example.base.entity.*;
import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.repository.*;
import com.example.base.service.kanji.KanjiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KanjiServiceImpl implements KanjiService {

    private final KanjiLessonModuleRepository moduleRepository;
    private final KanjiDetailRepository kanjiRepository;
    private final AccountRepository accountRepository;
    private final PersonalKanjiDeckItemRepository kanjiDeckItemRepository;

    @Override
    public List<KanjiModuleDto> getModules(JlptLevel level) {
        List<KanjiLessonModule> modules = level == null
                ? moduleRepository.findByOrderByModuleIdAsc()
                : moduleRepository.findByJlptLevelOrderByModuleIdAsc(level);
        return modules.stream().map(this::toModuleDto).toList();
    }

    @Override
    public KanjiModuleDto getModule(Long moduleId) {
        return toModuleDto(requireModule(moduleId));
    }

    @Override
    @Transactional
    public KanjiModuleDto createModule(KanjiModuleRequest request, Long creatorId) {
        Account creator = accountRepository.findByAccountIdAndDeletedAtIsNull(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", creatorId));
        KanjiLessonModule module = KanjiLessonModule.builder()
                .jlptLevel(request.getJlptLevel())
                .title(request.getTitle().trim())
                .description(trimToNull(request.getDescription()))
                .createdBy(creator)
                .build();
        return toModuleDto(moduleRepository.save(module));
    }

    @Override
    @Transactional
    public KanjiModuleDto updateModule(Long moduleId, KanjiModuleRequest request) {
        KanjiLessonModule module = requireModule(moduleId);
        module.setJlptLevel(request.getJlptLevel());
        module.setTitle(request.getTitle().trim());
        module.setDescription(trimToNull(request.getDescription()));
        return toModuleDto(moduleRepository.save(module));
    }

    @Override
    @Transactional
    public void deleteModule(Long moduleId) {
        KanjiLessonModule module = requireModule(moduleId);
        if (kanjiDeckItemRepository.existsByKanji_Module_ModuleId(moduleId)) {
            throw new BadRequestException("Không thể xóa module vì có Kanji đang được lưu trong deck cá nhân");
        }
        moduleRepository.delete(module);
    }

    @Override
    public List<KanjiDetailDto> getKanji(Long moduleId, JlptLevel level, String search) {
        List<KanjiDetail> result;
        if (search != null && !search.isBlank()) {
            String keyword = search.trim();
            if (moduleId != null) {
                requireModule(moduleId);
                result = kanjiRepository.searchByModule(moduleId, keyword);
            } else if (level != null) {
                result = kanjiRepository.searchByJlptLevel(level, keyword);
            } else {
                result = kanjiRepository.search(keyword);
            }
        } else if (moduleId != null) {
            requireModule(moduleId);
            result = kanjiRepository.findByModule_ModuleIdOrderByKanjiIdAsc(moduleId);
        } else if (level != null) {
            result = kanjiRepository.findByJlptLevel(level);
        } else {
            result = kanjiRepository.findByOrderByKanjiIdAsc();
        }
        return result.stream().map(this::toKanjiDto).toList();
    }

    @Override
    public KanjiDetailDto getKanji(Long kanjiId) {
        return toKanjiDto(requireKanji(kanjiId));
    }

    @Override
    @Transactional
    public KanjiDetailDto createKanji(KanjiDetailRequest request) {
        KanjiDetail kanji = KanjiDetail.builder()
                .module(requireModule(request.getModuleId()))
                .character(request.getCharacter().trim())
                .onyomi(trimToNull(request.getOnyomi()))
                .kunyomi(trimToNull(request.getKunyomi()))
                .strokeOrderUrl(trimToNull(request.getStrokeOrderUrl()))
                .meaning(request.getMeaning().trim())
                .compoundWords(trimToNull(request.getCompoundWords()))
                .isPreview(Boolean.TRUE.equals(request.getIsPreview()))
                .build();
        return toKanjiDto(kanjiRepository.save(kanji));
    }

    @Override
    @Transactional
    public KanjiDetailDto updateKanji(Long kanjiId, KanjiDetailRequest request) {
        KanjiDetail kanji = requireKanji(kanjiId);
        kanji.setModule(requireModule(request.getModuleId()));
        kanji.setCharacter(request.getCharacter().trim());
        kanji.setOnyomi(trimToNull(request.getOnyomi()));
        kanji.setKunyomi(trimToNull(request.getKunyomi()));
        kanji.setStrokeOrderUrl(trimToNull(request.getStrokeOrderUrl()));
        kanji.setMeaning(request.getMeaning().trim());
        kanji.setCompoundWords(trimToNull(request.getCompoundWords()));
        if (request.getIsPreview() != null) kanji.setPreview(request.getIsPreview());
        return toKanjiDto(kanjiRepository.save(kanji));
    }

    @Override
    @Transactional
    public void deleteKanji(Long kanjiId) {
        KanjiDetail kanji = requireKanji(kanjiId);
        if (kanjiDeckItemRepository.existsByKanji_KanjiId(kanjiId)) {
            throw new BadRequestException("Không thể xóa Kanji vì chữ này đang được lưu trong deck cá nhân");
        }
        kanjiRepository.delete(kanji);
    }

    private KanjiLessonModule requireModule(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kanji module", "id", id));
    }

    private KanjiDetail requireKanji(Long id) {
        return kanjiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kanji", "id", id));
    }

    private KanjiModuleDto toModuleDto(KanjiLessonModule module) {
        return KanjiModuleDto.builder()
                .moduleId(module.getModuleId())
                .jlptLevel(module.getJlptLevel())
                .title(module.getTitle())
                .description(module.getDescription())
                .createdById(module.getCreatedBy().getAccountId())
                .createdByName(module.getCreatedBy().getFullName())
                .kanjiCount(Math.toIntExact(kanjiRepository.countByModule_ModuleId(module.getModuleId())))
                .createdAt(module.getCreatedAt())
                .updatedAt(module.getUpdatedAt())
                .build();
    }

    private KanjiDetailDto toKanjiDto(KanjiDetail kanji) {
        return KanjiDetailDto.builder()
                .kanjiId(kanji.getKanjiId())
                .moduleId(kanji.getModule().getModuleId())
                .moduleTitle(kanji.getModule().getTitle())
                .jlptLevel(kanji.getModule().getJlptLevel())
                .character(kanji.getCharacter())
                .onyomi(kanji.getOnyomi())
                .kunyomi(kanji.getKunyomi())
                .strokeOrderUrl(kanji.getStrokeOrderUrl())
                .meaning(kanji.getMeaning())
                .compoundWords(kanji.getCompoundWords())
                .isPreview(kanji.isPreview())
                .createdAt(kanji.getCreatedAt())
                .updatedAt(kanji.getUpdatedAt())
                .build();
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
