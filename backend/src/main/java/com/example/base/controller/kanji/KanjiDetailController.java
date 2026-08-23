package com.example.base.controller.kanji;

import com.example.base.dto.kanji.KanjiDtos.*;
import com.example.base.dto.common.ApiResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.service.kanji.KanjiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API cho từng chữ Kanji. Controller chỉ nhận/thẩm định dữ liệu HTTP; việc chọn query,
 * kiểm tra module và bảo vệ Kanji đang được personal deck sử dụng nằm ở service.
 */
@RestController
@RequestMapping("/kanji-details")
@RequiredArgsConstructor
public class KanjiDetailController {
    private final KanjiService kanjiService;

    @GetMapping
    public ApiResponse<List<KanjiDetailDto>> getAll(@RequestParam(required = false) Long moduleId,
                                                    @RequestParam(required = false) JlptLevel jlptLevel,
                                                    @RequestParam(required = false) String search) {
        // Truyền cả ba điều kiện xuống service để search vẫn có thể giữ module hoặc JLPT đã chọn.
        return ApiResponse.success(kanjiService.getKanji(moduleId, jlptLevel, search));
    }

    @GetMapping("/{id}")
    public ApiResponse<KanjiDetailDto> getOne(@PathVariable Long id) {
        // Lay chi tiet mot chu kanji theo id; service se bao loi neu khong tim thay.
        return ApiResponse.success(kanjiService.getKanji(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'Lecturer', 'ROLE_Lecturer', 'Author', 'ROLE_Author')")
    public ApiResponse<KanjiDetailDto> create(@Valid @RequestBody KanjiDetailRequest request) {
        // Tao kanji detail moi; service kiem tra module, chuan hoa cac truong text, roi save.
        return ApiResponse.success("Kanji created successfully", kanjiService.createKanji(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'Lecturer', 'ROLE_Lecturer', 'Author', 'ROLE_Author')")
    public ApiResponse<KanjiDetailDto> update(@PathVariable Long id, @Valid @RequestBody KanjiDetailRequest request) {
        // Cap nhat kanji detail theo id; service load kanji cu, validate module moi, roi ghi cac field request.
        return ApiResponse.success("Kanji updated successfully", kanjiService.updateKanji(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'Lecturer', 'ROLE_Lecturer', 'Author', 'ROLE_Author')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        // Xoa kanji detail theo id; service chan xoa neu chu kanji dang duoc luu trong personal deck.
        kanjiService.deleteKanji(id);
        return ApiResponse.success("Kanji deleted successfully", null);
    }
}
