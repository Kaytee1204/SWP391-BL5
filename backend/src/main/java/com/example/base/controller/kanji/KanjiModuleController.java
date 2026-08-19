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

@RestController
@RequestMapping("/kanji-modules")
@RequiredArgsConstructor
public class KanjiModuleController {
    private final KanjiService kanjiService;

    @GetMapping
    public ApiResponse<List<KanjiModuleDto>> getAll(@RequestParam(required = false) JlptLevel jlptLevel) {
        // Lay danh sach kanji module; neu co jlptLevel thi service loc theo level, neu khong thi tra ve tat ca.
        return ApiResponse.success(kanjiService.getModules(jlptLevel));
    }

    @GetMapping("/{id}")
    public ApiResponse<KanjiModuleDto> getOne(@PathVariable Long id) {
        // Lay chi tiet mot kanji module theo id; service se throw not found neu module khong ton tai.
        return ApiResponse.success(kanjiService.getModule(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'Lecturer', 'ROLE_Lecturer', 'Author', 'ROLE_Author')")
    public ApiResponse<KanjiModuleDto> create(@Valid @RequestBody KanjiModuleRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        // Tao kanji module moi; validate request, lay creator tu user dang login, roi tra ve module vua tao.
        return ApiResponse.success("Kanji module created successfully", kanjiService.createModule(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'Lecturer', 'ROLE_Lecturer', 'Author', 'ROLE_Author')")
    public ApiResponse<KanjiModuleDto> update(@PathVariable Long id, @Valid @RequestBody KanjiModuleRequest request) {
        // Cap nhat kanji module theo id; service kiem tra module ton tai va ghi lai cac field tu request.
        return ApiResponse.success("Kanji module updated successfully", kanjiService.updateModule(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'Lecturer', 'ROLE_Lecturer', 'Author', 'ROLE_Author')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        // Xoa kanji module theo id; service chan xoa neu module co kanji dang nam trong personal deck.
        kanjiService.deleteModule(id);
        return ApiResponse.success("Kanji module deleted successfully", null);
    }
}
