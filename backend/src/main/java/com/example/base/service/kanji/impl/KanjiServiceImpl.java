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
        // null nghĩa là xem tất cả; có level thì repository lọc ngay trong database rồi mới map DTO.
        List<KanjiLessonModule> modules = level == null
                ? moduleRepository.findByOrderByModuleIdAsc()
                : moduleRepository.findByJlptLevelOrderByModuleIdAsc(level);
        return modules.stream().map(this::toModuleDto).toList();
    }

    @Override
    public KanjiModuleDto getModule(Long moduleId) {
        // Lay mot module theo id; requireModule kiem tra ton tai truoc khi map entity sang DTO.
        return toModuleDto(requireModule(moduleId));
    }

    @Override
    @Transactional
    public KanjiModuleDto createModule(KanjiModuleRequest request, Long creatorId) {
        // creatorId lấy từ JWT. Service nạp Account thật để khóa ngoại created_by luôn hợp lệ.
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
        // Cap nhat module kanji; load module theo id, ghi lai level/title/description tu request, save, roi map DTO.
        KanjiLessonModule module = requireModule(moduleId);
        module.setJlptLevel(request.getJlptLevel());
        module.setTitle(request.getTitle().trim());
        module.setDescription(trimToNull(request.getDescription()));
        return toModuleDto(moduleRepository.save(module));
    }

    @Override
    @Transactional
    public void deleteModule(Long moduleId) {
        // Không cho xóa nếu Kanji con đang nằm trong personal deck, tránh làm mất dữ liệu học của student.
        KanjiLessonModule module = requireModule(moduleId);
        if (kanjiDeckItemRepository.existsByKanji_Module_ModuleId(moduleId)) {
            throw new BadRequestException("Không thể xóa module vì có Kanji đang được lưu trong deck cá nhân");
        }
        moduleRepository.delete(module);
    }

    @Override
    public List<KanjiDetailDto> getKanji(Long moduleId, JlptLevel level, String search) {
        // Chọn đúng một nhánh truy vấn. Search ưu tiên trước nhưng vẫn giữ module/JLPT filter nếu được truyền.
        List<KanjiDetail> result;
        if (search != null && !search.isBlank()) {
            String keyword = search.trim();
            if (moduleId != null) {
                // Kiểm tra module tồn tại để phân biệt "module rỗng" với "ID module sai".
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
        // Lay mot kanji detail theo id; requireKanji dam bao entity ton tai truoc khi map DTO.
        return toKanjiDto(requireKanji(kanjiId));
    }

    @Override
    @Transactional
    public KanjiDetailDto createKanji(KanjiDetailRequest request) {
        // moduleId từ request được đổi thành entity bằng requireModule trước khi gắn quan hệ.
        KanjiDetail kanji = KanjiDetail.builder()
                .module(requireModule(request.getModuleId()))
                .character(request.getCharacter().trim())
                .onyomi(trimToNull(request.getOnyomi()))
                .kunyomi(trimToNull(request.getKunyomi()))
                .meaning(request.getMeaning().trim())
                .compoundWords(trimToNull(request.getCompoundWords()))
                .build();
        return toKanjiDto(kanjiRepository.save(kanji));
    }

    @Override
    @Transactional
    public KanjiDetailDto updateKanji(Long kanjiId, KanjiDetailRequest request) {
        // Cap nhat kanji detail; load kanji cu, gan module moi hop le va trim cac field.
        KanjiDetail kanji = requireKanji(kanjiId);
        kanji.setModule(requireModule(request.getModuleId()));
        kanji.setCharacter(request.getCharacter().trim());
        kanji.setOnyomi(trimToNull(request.getOnyomi()));
        kanji.setKunyomi(trimToNull(request.getKunyomi()));
        kanji.setMeaning(request.getMeaning().trim());
        kanji.setCompoundWords(trimToNull(request.getCompoundWords()));
        return toKanjiDto(kanjiRepository.save(kanji));
    }

    @Override
    @Transactional
    public void deleteKanji(Long kanjiId) {
        // Chặn xóa Kanji nguồn khi đang được personal deck tham chiếu để bảo toàn deck của học viên.
        KanjiDetail kanji = requireKanji(kanjiId);
        if (kanjiDeckItemRepository.existsByKanji_KanjiId(kanjiId)) {
            throw new BadRequestException("Không thể xóa Kanji vì chữ này đang được lưu trong deck cá nhân");
        }
        kanjiRepository.delete(kanji);
    }

    private KanjiLessonModule requireModule(Long id) {
        // Tim module theo id; neu khong co thi nem ResourceNotFoundException de controller tra loi loi phu hop.
        return moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kanji module", "id", id));
    }

    private KanjiDetail requireKanji(Long id) {
        // Tim kanji theo id; neu khong co thi nem ResourceNotFoundException de dung luong nghiep vu hien tai.
        return kanjiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kanji", "id", id));
    }

    private KanjiModuleDto toModuleDto(KanjiLessonModule module) {
        // Làm phẳng người tạo và chạy count query để UI có kanjiCount mà không tải collection LAZY.
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
        // JLPT thuộc module cha; đưa vào DTO giúp frontend render Kanji bằng một object phẳng.
        return KanjiDetailDto.builder()
                .kanjiId(kanji.getKanjiId())
                .moduleId(kanji.getModule().getModuleId())
                .moduleTitle(kanji.getModule().getTitle())
                .jlptLevel(kanji.getModule().getJlptLevel())
                .character(kanji.getCharacter())
                .onyomi(kanji.getOnyomi())
                .kunyomi(kanji.getKunyomi())
                .meaning(kanji.getMeaning())
                .compoundWords(kanji.getCompoundWords())
                .createdAt(kanji.getCreatedAt())
                .updatedAt(kanji.getUpdatedAt())
                .build();
    }

    private String trimToNull(String value) {
        // Chuẩn hóa field tùy chọn để database không chứa cả null lẫn nhiều dạng chuỗi trắng.
        return value == null || value.isBlank() ? null : value.trim();
    }
}
