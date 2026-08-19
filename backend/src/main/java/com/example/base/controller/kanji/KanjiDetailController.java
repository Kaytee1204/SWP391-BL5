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

@RestController
@RequestMapping("/kanji-details")
@RequiredArgsConstructor
public class KanjiDetailController {
    private final KanjiService kanjiService;

    @GetMapping
    public ApiResponse<List<KanjiDetailDto>> getAll(@RequestParam(required = false) Long moduleId,
                                                    @RequestParam(required = false) JlptLevel jlptLevel,
                                                    @RequestParam(required = false) String search) {
        return ApiResponse.success(kanjiService.getKanji(moduleId, jlptLevel, search));
    }

    @GetMapping("/{id}")
    public ApiResponse<KanjiDetailDto> getOne(@PathVariable Long id) {
        return ApiResponse.success(kanjiService.getKanji(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('Manager','Lecturer','Author')")
    public ApiResponse<KanjiDetailDto> create(@Valid @RequestBody KanjiDetailRequest request) {
        return ApiResponse.success("Kanji created successfully", kanjiService.createKanji(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Manager','Lecturer','Author')")
    public ApiResponse<KanjiDetailDto> update(@PathVariable Long id, @Valid @RequestBody KanjiDetailRequest request) {
        return ApiResponse.success("Kanji updated successfully", kanjiService.updateKanji(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Manager','Lecturer','Author')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        kanjiService.deleteKanji(id);
        return ApiResponse.success("Kanji deleted successfully", null);
    }
}
