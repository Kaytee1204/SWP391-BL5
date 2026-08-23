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
 * REST API cho Kanji lesson module. Quyền xem giữ nguyên theo cơ chế Kanji công khai;
 * ba thao tác thay đổi dữ liệu chỉ dành cho Lecturer nhờ @PreAuthorize.
 */
@RestController
@RequestMapping("/kanji-modules")
@RequiredArgsConstructor
public class KanjiModuleController {
    private final KanjiService kanjiService;

    @GetMapping
    public ApiResponse<List<KanjiModuleDto>> getAll(@RequestParam(required = false) JlptLevel jlptLevel) {
        // Query parameter là tùy chọn: null lấy tất cả, N5-N1 lọc ngay tại repository.
        return ApiResponse.success(kanjiService.getModules(jlptLevel));
    }

    @GetMapping("/{id}")
    public ApiResponse<KanjiModuleDto> getOne(@PathVariable Long id) {
        // Lay chi tiet mot kanji module theo id; service se throw not found neu module khong ton tai.
        return ApiResponse.success(kanjiService.getModule(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer')")
    public ApiResponse<KanjiModuleDto> create(@Valid @RequestBody KanjiModuleRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        // @Valid chặn title/JLPT thiếu; creator lấy từ JWT để client không giả mạo người tạo.
        return ApiResponse.success("Kanji module created successfully", kanjiService.createModule(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer')")
    public ApiResponse<KanjiModuleDto> update(@PathVariable Long id, @Valid @RequestBody KanjiModuleRequest request) {
        // Cap nhat kanji module theo id; service kiem tra module ton tai va ghi lai cac field tu request.
        return ApiResponse.success("Kanji module updated successfully", kanjiService.updateModule(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        // Xoa kanji module theo id; service chan xoa neu module co kanji dang nam trong personal deck.
        kanjiService.deleteModule(id);
        return ApiResponse.success("Kanji module deleted successfully", null);
    }
}
