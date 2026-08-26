package com.example.base.service.kanji;

import com.example.base.dto.kanji.KanjiDtos.*;
import com.example.base.entity.JlptLevel;

import java.util.List;

/**
 * Hợp đồng nghiệp vụ chung cho module (màn 36-39) và Kanji detail (màn 40-43).
 * Controller không cần biết cách lọc, audit, khóa đồng thời hoặc kiểm tra tham chiếu deck.
 */
public interface KanjiService {
    // Lấy module, có thể lọc theo JLPT; null mang nghĩa lấy tất cả.
    List<KanjiModuleDto> getModules(JlptLevel jlptLevel);
    // Lấy một module theo ID để xem hoặc nạp dữ liệu ban đầu cho form sửa.
    KanjiModuleDto getModule(Long moduleId);
    // Tạo module và gắn người tạo theo creatorId lấy từ JWT.
    KanjiModuleDto createModule(KanjiModuleRequest request, Long creatorId);
    // Cập nhật module; request phải mang version hiện tại.
    KanjiModuleDto updateModule(Long moduleId, KanjiModuleRequest request, Long lecturerId);
    // Xóa module chỉ khi không có Kanji con đang được personal deck tham chiếu.
    void deleteModule(Long moduleId);
    // Lấy Kanji theo module/JLPT/keyword; implementation quyết định độ ưu tiên của các filter.
    List<KanjiDetailDto> getKanji(Long moduleId, JlptLevel jlptLevel, String search);
    // Lấy chi tiết một chữ Kanji theo ID.
    KanjiDetailDto getKanji(Long kanjiId);
    // Tạo một Kanji detail và liên kết với module có thật.
    KanjiDetailDto createKanji(KanjiDetailRequest request, Long lecturerId);
    // Cập nhật Kanji detail; giữ createdBy và thay updatedBy.
    KanjiDetailDto updateKanji(Long kanjiId, KanjiDetailRequest request, Long lecturerId);
    // Xóa Kanji detail nếu chưa được lưu trong personal deck.
    void deleteKanji(Long kanjiId);
}
