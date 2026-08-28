package com.example.base.controller.culture;

import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.common.PageResponse;
import com.example.base.dto.culture.CultureArticleCreateRequest;
import com.example.base.dto.culture.CultureArticleResponse;
import com.example.base.dto.culture.CultureArticleUpdateRequest;
import com.example.base.security.UserPrincipal;
import com.example.base.service.culture.CultureArticleService;
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
@RequestMapping("/culture-articles")
@RequiredArgsConstructor
@Tag(name = "Culture Articles", description = "APIs for viewing, publishing, editing, and deleting Japanese culture and educational articles")
public class CultureArticleController {

    private final CultureArticleService cultureArticleService;

    // 1. Xem danh sách bài viết (Công khai cho mọi người đọc)
    @GetMapping
    @Operation(summary = "View Culture Articles with search and status filters (All roles & Public)")
    public ResponseEntity<ApiResponse<PageResponse<CultureArticleResponse>>> getArticles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<CultureArticleResponse> response = cultureArticleService.searchArticles(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 2. Tác giả & Quản lý xem danh sách các bài do chính mình viết
    @GetMapping("/my-articles")
    @PreAuthorize("hasAnyAuthority('Author', 'ROLE_Author', 'ROLE_AUTHOR', 'author', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "View Articles authored by the current logged-in Author or Manager")
    public ResponseEntity<ApiResponse<PageResponse<CultureArticleResponse>>> getMyArticles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<CultureArticleResponse> response = cultureArticleService.searchMyArticles(keyword, status, currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 3. Xem chi tiết 1 bài viết theo ID (Công khai cho mọi người)
    @GetMapping("/{id}")
    @Operation(summary = "View single Culture Article detail by ID (All roles & Public)")
    public ResponseEntity<ApiResponse<CultureArticleResponse>> getArticleById(@PathVariable Long id) {
        CultureArticleResponse response = cultureArticleService.getArticleById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 4. Đăng bài viết mới (Author & Manager)
    @PostMapping
    @PreAuthorize("hasAnyAuthority('Author', 'ROLE_Author', 'ROLE_AUTHOR', 'author', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Publish a new Culture Article (Author & Manager)")
    public ResponseEntity<ApiResponse<CultureArticleResponse>> createArticle(
            @Valid @RequestBody CultureArticleCreateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        // Gọi Service xử lý lưu bài và truyền thông tin Author/Manager đang đăng nhập
        CultureArticleResponse response = cultureArticleService.createArticle(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Article published successfully", response));
    }

    // 5. Cập nhật bài viết (Author sở hữu bài HOẶC Manager được quyền sửa)
    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.POST})
    @PreAuthorize("hasAnyAuthority('Author', 'ROLE_Author', 'ROLE_AUTHOR', 'author', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Edit an existing Culture Article (Author owner or Manager)")
    public ResponseEntity<ApiResponse<CultureArticleResponse>> updateArticle(
            @PathVariable Long id,
            @Valid @RequestBody CultureArticleUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        // Service sẽ kiểm tra xem bài này do currentUser tạo hoặc currentUser là Manager
        CultureArticleResponse response = cultureArticleService.updateArticle(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Article updated successfully", response));
    }

    // 6. Xóa bài viết (Chỉ Author sở hữu bài HOẶC Manager mới có quyền xóa)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Author', 'ROLE_Author', 'ROLE_AUTHOR', 'author', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Delete a Culture Article (Author owner or Manager)")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        // Service sẽ kiểm tra quyền: Nếu là Manager -> OK, nếu là Author -> phải đúng chủ bài viết
        cultureArticleService.deleteArticle(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully", null));
    }
}
