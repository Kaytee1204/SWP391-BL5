package com.example.base.controller.error_report;


import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.error_report.ErrorReportRequest;
import com.example.base.dto.error_report.ErrorReportResponse;
import com.example.base.dto.error_report.UpdateReportStatusRequest;
import com.example.base.security.UserPrincipal;
import com.example.base.service.error_report.ErrorReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/error-reports")
@SecurityRequirement(name = "BearerAuth")
@Tag(name ="Content Error Reports", description = "APIs for Student to report content error")
@RequiredArgsConstructor
public class ErrorReportController {

    private final ErrorReportService reportService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Student', 'ROLE_Student', 'ROLE_STUDENT', 'student')")
    @Operation(summary = "Create Content Error Report (Student only)")
    public ResponseEntity<ApiResponse<ErrorReportResponse>> createReport(@Valid @RequestBody ErrorReportRequest request,
                                                                         @AuthenticationPrincipal UserPrincipal currentUser){
        ErrorReportResponse response = reportService.createReport(request, currentUser.getAccountId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gửi báo cáo lỗi thành công", response));
    }

    // 2. Xem/Theo dõi danh sách báo cáo của bản thân
    @GetMapping("/my-reports")
    @PreAuthorize("hasAnyAuthority('Student', 'ROLE_Student', 'ROLE_STUDENT', 'student')")
    @Operation(summary = "View/Track Error Reports (Student only)")
    // KHAI BÁO CÁC Ô NHẬP LIỆU THỦ CÔNG CHO SWAGGER:
    @Parameter(name = "page", description = "Trang hiện tại (bắt đầu từ 0)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0"))
    @Parameter(name = "size", description = "Số lượng báo cáo trên 1 trang", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "20"))
    @Parameter(name = "sort", description = "Cột sắp xếp (Ví dụ: createdAt,desc)", in = ParameterIn.QUERY, schema = @Schema(type = "string", defaultValue = "createdAt,desc"))
    public ResponseEntity<ApiResponse<Page<ErrorReportResponse>>> getMyReports(
            @AuthenticationPrincipal UserPrincipal currentUser,

            // DÙNG @Parameter(hidden = true) ĐỂ GIẤU CÁC LỖI TẠO JSON CỦA SWAGGER
            @Parameter(hidden = true)
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ErrorReportResponse> response = reportService.getMyReports(currentUser.getAccountId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 3. Sửa báo cáo lỗi
    @PutMapping("/{reportId}")
    @PreAuthorize("hasAnyAuthority('Student', 'ROLE_Student', 'ROLE_STUDENT', 'student')")
    @Operation(summary = "Update Error Report Description (Student only)")
    public ResponseEntity<ApiResponse<ErrorReportResponse>> updateReport(
            @PathVariable Long reportId,
            @Valid @RequestBody ErrorReportRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ErrorReportResponse response = reportService.updateDescription(reportId, request, currentUser.getAccountId());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật báo cáo thành công", response));
    }

    // 4. Hủy báo cáo
    @PatchMapping("/{reportId}/cancel")
    @PreAuthorize("hasAnyAuthority('Student', 'ROLE_Student', 'ROLE_STUDENT', 'student')")
    @Operation(summary = "Cancel Error Report (Student only)")
    public ResponseEntity<ApiResponse<Void>> cancelReport(
            @PathVariable Long reportId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        reportService.cancelReport(reportId, currentUser.getAccountId());
        return ResponseEntity.ok(ApiResponse.success("Báo cáo đã được hủy bỏ", null));
    }
    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('Manager', 'Lecturer', 'ROLE_Manager', 'ROLE_Lecturer', 'ROLE_MANAGER', 'ROLE_LECTURER', 'manager', 'lecturer')")
    @Operation(summary = "Get All Error Reports (Manager/Lecturer only)", description = "Lấy danh sách tất cả báo cáo lỗi. Có thể lọc theo status (VD: PENDING, RESOLVED)")
    @Parameter(name = "status", description = "Lọc theo trạng thái (Ví dụ: PENDING)", in = ParameterIn.QUERY, schema = @Schema(type = "string"))
    @Parameter(name = "page", description = "Trang hiện tại (bắt đầu từ 0)", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "0"))
    @Parameter(name = "size", description = "Số lượng báo cáo trên 1 trang", in = ParameterIn.QUERY, schema = @Schema(type = "integer", defaultValue = "20"))
    @Parameter(name = "sort", description = "Cột sắp xếp (Ví dụ: createdAt,desc)", in = ParameterIn.QUERY, schema = @Schema(type = "string", defaultValue = "createdAt,desc"))
    public ResponseEntity<ApiResponse<Page<ErrorReportResponse>>> getAllReports(
            @RequestParam(required = false) String status,
            @Parameter(hidden = true)
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ErrorReportResponse> response = reportService.getAllReports(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Duyệt / Cập nhật trạng thái báo cáo
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('Manager', 'Lecturer', 'ROLE_Manager', 'ROLE_Lecturer', 'ROLE_MANAGER', 'ROLE_LECTURER', 'manager', 'lecturer')")
    @Operation(summary = "Update Error Report Status (Manager/Lecturer only)", description = "Thay đổi trạng thái báo cáo sang IN_PROGRESS, RESOLVED, hoặc REJECTED")
    public ResponseEntity<ApiResponse<ErrorReportResponse>> updateReportStatus(
            @PathVariable("id") Long reportId,
            @Valid @RequestBody UpdateReportStatusRequest request) {

        ErrorReportResponse response = reportService.updateReportStatus(reportId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
