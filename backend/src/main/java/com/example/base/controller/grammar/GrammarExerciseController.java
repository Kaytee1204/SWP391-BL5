package com.example.base.controller.grammar;

import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.common.PageResponse;
import com.example.base.dto.exercise.GrammarExerciseCreateRequest;
import com.example.base.dto.exercise.GrammarExerciseResponse;
import com.example.base.dto.exercise.GrammarExerciseUpdateRequest;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import com.example.base.service.grammar.GrammarExerciseService;
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
@RequestMapping("/grammar-exercises")
@RequiredArgsConstructor
@Tag(name = "Grammar Exercises", description = "APIs for Japanese Grammar Multiple-Choice Exercises (N1-N5)")
public class GrammarExerciseController {

    private final GrammarExerciseService grammarExerciseService;

    // 1. Xem danh sách bài tập (Dành cho mọi user/học sinh luyện tập)
    @GetMapping
    @Operation(summary = "View Grammar Exercises with keyword and JLPT level filters (Public / Practice Quiz)")
    public ResponseEntity<ApiResponse<PageResponse<GrammarExerciseResponse>>> getExercises(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JlptLevel jlptLevel,
            @PageableDefault(page = 0, size = 50, sort = "exerciseId", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<GrammarExerciseResponse> response = grammarExerciseService.searchExercises(keyword, jlptLevel, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 2. Giảng viên xem bài tập do chính mình tạo
    @GetMapping("/my-exercises")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "View Grammar Exercises created by the logged-in Lecturer")
    public ResponseEntity<ApiResponse<PageResponse<GrammarExerciseResponse>>> getMyExercises(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JlptLevel jlptLevel,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(page = 0, size = 50, sort = "exerciseId", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<GrammarExerciseResponse> response = grammarExerciseService.searchMyExercises(keyword, jlptLevel, currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 3. Xem chi tiết 1 bài tập theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Student', 'ROLE_Student', 'ROLE_STUDENT', 'student', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "View single Grammar Exercise detail by ID")
    public ResponseEntity<ApiResponse<GrammarExerciseResponse>> getExerciseById(@PathVariable Long id) {
        GrammarExerciseResponse response = grammarExerciseService.getExerciseById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 4. Tạo bài tập trắc nghiệm mới (Chỉ Lecturer & Manager)
    @PostMapping
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Create a new Grammar Exercise (Lecturer and Manager only)")
    public ResponseEntity<ApiResponse<GrammarExerciseResponse>> createExercise(
            @Valid @RequestBody GrammarExerciseCreateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        GrammarExerciseResponse response = grammarExerciseService.createExercise(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Grammar exercise created successfully", response));
    }

    // 5. Cập nhật bài tập trắc nghiệm (Chỉ Lecturer sở hữu hoặc Manager)
    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.POST})
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Update an existing Grammar Exercise (Lecturer owner or Manager)")
    public ResponseEntity<ApiResponse<GrammarExerciseResponse>> updateExercise(
            @PathVariable Long id,
            @Valid @RequestBody GrammarExerciseUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        GrammarExerciseResponse response = grammarExerciseService.updateExercise(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Grammar exercise updated successfully", response));
    }

    // 6. Xóa bài tập trắc nghiệm (Chỉ Lecturer sở hữu hoặc Manager)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Delete a Grammar Exercise (Lecturer owner or Manager)")
    public ResponseEntity<ApiResponse<Void>> deleteExercise(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        grammarExerciseService.deleteExercise(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Grammar exercise deleted successfully", null));
    }
}
