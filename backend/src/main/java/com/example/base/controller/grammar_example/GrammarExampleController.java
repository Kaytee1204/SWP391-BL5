package com.example.base.controller.grammar_example;

import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.grammar_example.GrammarExampleRequest;
import com.example.base.dto.grammar_example.GrammarExampleResponse;
import com.example.base.security.UserPrincipal;
import com.example.base.service.grammar_example.GrammarExampleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/grammar-patterns")
@SecurityRequirement(name = "BearerAuth") // Khớp 100% với OpenApiConfig
@Tag(name = "Grammar Examples", description = "APIs for viewing, creating, updating, and deleting Grammar Examples")
@RequiredArgsConstructor
public class GrammarExampleController {

    private final GrammarExampleService exampleService;

    // 1. Học sinh, Giảng viên, Khách đều có thể xem danh sách ví dụ theo patternId
    @GetMapping("/{patternId}/examples")
    @Operation(summary = "Get list of examples by Pattern ID (Public / All Roles)")
    public ResponseEntity<ApiResponse<List<GrammarExampleResponse>>> getExamplesByPattern(
            @PathVariable Long patternId) {
        List<GrammarExampleResponse> responses = exampleService.GetExampleByPatternId(patternId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    // 2. Xem chi tiết 1 câu ví dụ
    @GetMapping("/examples/{exampleId}")
    @Operation(summary = "Get single example detail by ID (Public / All Roles)")
    public ResponseEntity<ApiResponse<GrammarExampleResponse>> getExampleById(
            @PathVariable Long exampleId) {
        GrammarExampleResponse response = exampleService.getExampleById(exampleId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 3. Giảng viên tạo câu ví dụ mới
    @PostMapping("/{patternId}/examples")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Create a new grammar example (Lecturer & Manager only)")
    public ResponseEntity<ApiResponse<GrammarExampleResponse>> createExample(
            @PathVariable Long patternId,
            @Valid @RequestBody GrammarExampleRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        GrammarExampleResponse response = exampleService.createExample(patternId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Grammar example created successfully", response));
    }

    // 4. Giảng viên/Quản lý cập nhật câu ví dụ
    @RequestMapping(value = "/examples/{exampleId}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Update an existing grammar example (Lecturer & Manager only)")
    public ResponseEntity<ApiResponse<GrammarExampleResponse>> updateExample(
            @PathVariable Long exampleId,
            @Valid @RequestBody GrammarExampleRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        GrammarExampleResponse response = exampleService.updateExample(exampleId, request);
        return ResponseEntity.ok(ApiResponse.success("Grammar example updated successfully", response));
    }

    // 5. Giảng viên/Quản lý xóa câu ví dụ
    @DeleteMapping("/examples/{exampleId}")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Delete a grammar example (Lecturer & Manager only)")
    public ResponseEntity<ApiResponse<Void>> deleteExample(
            @PathVariable Long exampleId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        exampleService.DeleteExample(exampleId);
        return ResponseEntity.ok(ApiResponse.success("Grammar example deleted successfully", null));
    }
}