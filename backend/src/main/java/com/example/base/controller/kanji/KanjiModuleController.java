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
        return ApiResponse.success(kanjiService.getModules(jlptLevel));
    }

    @GetMapping("/{id}")
    public ApiResponse<KanjiModuleDto> getOne(@PathVariable Long id) {
        return ApiResponse.success(kanjiService.getModule(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'Lecturer', 'ROLE_Lecturer', 'Author', 'ROLE_Author')")
    public ApiResponse<KanjiModuleDto> create(@Valid @RequestBody KanjiModuleRequest request,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Kanji module created successfully", kanjiService.createModule(request, principal.getAccountId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'Lecturer', 'ROLE_Lecturer', 'Author', 'ROLE_Author')")
    public ApiResponse<KanjiModuleDto> update(@PathVariable Long id, @Valid @RequestBody KanjiModuleRequest request) {
        return ApiResponse.success("Kanji module updated successfully", kanjiService.updateModule(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'Lecturer', 'ROLE_Lecturer', 'Author', 'ROLE_Author')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        kanjiService.deleteModule(id);
        return ApiResponse.success("Kanji module deleted successfully", null);
    }
}
