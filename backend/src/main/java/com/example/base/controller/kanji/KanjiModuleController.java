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
 * Điểm vào HTTP của màn 36-39 - quản lý module bài Kanji.
 * GET cho phép đọc danh sách/chi tiết; các endpoint ghi yêu cầu Lecturer hoặc Manager.
 * Module là cha của Kanji detail, vì vậy điều kiện xóa an toàn được xử lý ở service thay vì controller.
 */
@RestController
@RequestMapping("/kanji-modules")
@RequiredArgsConstructor
public class KanjiModuleController {
    private final KanjiService kanjiService;

    @GetMapping
    public ApiResponse<List<KanjiModuleDto>> getAll(@RequestParam(required = false) JlptLevel jlptLevel) {
        // jlptLevel null có nghĩa lấy toàn bộ module; DTO trả thêm kanjiCount cho bảng quản lý.
        return ApiResponse.success(kanjiService.getModules(jlptLevel));
    }

    @GetMapping("/{id}")
    public ApiResponse<KanjiModuleDto> getOne(@PathVariable Long id) {
        return ApiResponse.success(kanjiService.getModule(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    public ApiResponse<KanjiModuleDto> create(@Valid @RequestBody KanjiModuleRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        // Người tạo lấy từ JWT, không nhận createdById do client gửi lên.
        return ApiResponse.success("Kanji module created successfully", kanjiService.createModule(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    public ApiResponse<KanjiModuleDto> update(@PathVariable Long id,
                                               @Valid @RequestBody KanjiModuleRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        // Người cập nhật lấy từ security context để client không thể mạo danh giảng viên khác.
        return ApiResponse.success("Kanji module updated successfully",
                kanjiService.updateModule(id, request, principal.getAccountId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        // Service sẽ chặn nếu Kanji con đang được lưu trong personal deck của học viên.
        kanjiService.deleteModule(id);
        return ApiResponse.success("Kanji module deleted successfully", null);
    }
}
