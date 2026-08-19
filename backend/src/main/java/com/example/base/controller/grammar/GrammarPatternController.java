package com.example.base.controller.grammar;

import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.common.PageResponse;
import com.example.base.dto.grammar.GrammarPatternCreateRequest;
import com.example.base.dto.grammar.GrammarPatternResponse;
import com.example.base.dto.grammar.GrammarPatternUpdateRequest;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import com.example.base.service.grammar.GrammarPatternService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/grammar-patterns")
@RequiredArgsConstructor
@Tag(name = "Grammar Patterns", description = "APIs for viewing, creating, updating, and managing Japanese Grammar Patterns (N1-N5)")
public class GrammarPatternController {

    private final GrammarPatternService grammarPatternService;

    // 1. Xem danh sách mẫu ngữ pháp (Tất cả mọi người & Khách đều xem được)
    @GetMapping
    @Operation(summary = "View Grammar Patterns with keyword and JLPT level filters (All roles & Public)")
    public ResponseEntity<ApiResponse<PageResponse<GrammarPatternResponse>>> getPatterns(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JlptLevel jlptLevel,
            @PageableDefault(page = 0, size = 50, sort = "patternId", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<GrammarPatternResponse> response = grammarPatternService.searchPatterns(keyword, jlptLevel, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 2. Giảng viên xem danh sách các mẫu ngữ pháp do chính mình tạo
    @GetMapping("/my-patterns")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    @Operation(summary = "View Grammar Patterns created by the logged-in Lecturer")
    public ResponseEntity<ApiResponse<PageResponse<GrammarPatternResponse>>> getMyPatterns(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JlptLevel jlptLevel,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(page = 0, size = 50, sort = "patternId", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<GrammarPatternResponse> response = grammarPatternService.searchMyPatterns(keyword, jlptLevel, currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 3. Xem chi tiết 1 mẫu ngữ pháp theo ID
    @GetMapping("/{id}")
    @Operation(summary = "View single Grammar Pattern detail by ID (All roles & Public)")
    public ResponseEntity<ApiResponse<GrammarPatternResponse>> getPatternById(@PathVariable Long id) {
        GrammarPatternResponse response = grammarPatternService.getPatternById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 4. Giảng viên tạo mẫu ngữ pháp mới (Role: Lecturer)
    @PostMapping
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    @Operation(summary = "Create a new Grammar Pattern (Lecturer only)")
    public ResponseEntity<ApiResponse<GrammarPatternResponse>> createPattern(
            @Valid @RequestBody GrammarPatternCreateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        GrammarPatternResponse response = grammarPatternService.createPattern(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Grammar pattern created successfully", response));
    }

    // 5. Giảng viên cập nhật mẫu ngữ pháp (Role: Lecturer owner or Manager)
    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.POST})
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Update an existing Grammar Pattern (Lecturer owner or Manager)")
    public ResponseEntity<ApiResponse<GrammarPatternResponse>> updatePattern(
            @PathVariable Long id,
            @Valid @RequestBody GrammarPatternUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        GrammarPatternResponse response = grammarPatternService.updatePattern(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Grammar pattern updated successfully", response));
    }

    // 6. Giảng viên hoặc Quản trị viên xóa mẫu ngữ pháp
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Delete a Grammar Pattern (Lecturer owner or Manager)")
    public ResponseEntity<ApiResponse<Void>> deletePattern(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        grammarPatternService.deletePattern(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Grammar pattern deleted successfully", null));
    }
}
