package com.example.base.controller.kanji;

import com.example.base.dto.kanji.KanjiDtos.*;
import com.example.base.dto.common.ApiResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import com.example.base.service.kanji.KanjiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Điểm vào HTTP của màn 40-43 - quản lý chi tiết từng chữ Kanji.
 * GET hỗ trợ lọc theo module/JLPT/từ khóa. POST/PUT/DELETE yêu cầu Lecturer/Manager;
 * service chịu trách nhiệm kiểm tra module cha, version và tham chiếu từ personal deck.
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
        // DTO làm phẳng moduleTitle/JLPT để frontend không phải gọi thêm API cho từng Kanji.
        return ApiResponse.success(kanjiService.getKanji(moduleId, jlptLevel, search));
    }

    @GetMapping("/{id}")
    public ApiResponse<KanjiDetailDto> getOne(@PathVariable Long id) {
        return ApiResponse.success(kanjiService.getKanji(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('Lecturer', 'Manager')")
    public ApiResponse<KanjiDetailDto> create(@Valid @RequestBody KanjiDetailRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        // Principal do JwtAuthenticationFilter nạp từ token, không lấy Lecturer từ request.
        return ApiResponse.success("Kanji created successfully", kanjiService.createKanji(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Lecturer', 'Manager')")
    public ApiResponse<KanjiDetailDto> update(@PathVariable Long id, @Valid @RequestBody KanjiDetailRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        // version trong request giúp phát hiện form đã cũ trước khi ghi đè dữ liệu mới.
        return ApiResponse.success("Kanji updated successfully", kanjiService.updateKanji(id, request, principal.getAccountId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Lecturer', 'Manager')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        // Không xóa trực tiếp repository tại đây vì service còn phải bảo vệ deck cá nhân.
        kanjiService.deleteKanji(id);
        return ApiResponse.success("Kanji deleted successfully", null);
    }
}
