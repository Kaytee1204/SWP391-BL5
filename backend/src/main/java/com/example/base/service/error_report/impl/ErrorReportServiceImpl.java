package com.example.base.service.error_report.impl;

import com.example.base.dto.error_report.ErrorReportRequest;
import com.example.base.dto.error_report.ErrorReportResponse;
import com.example.base.entity.ErrorReport;
import com.example.base.entity.ReportStatus;
import com.example.base.repository.ErrorReportRepository;
import com.example.base.service.error_report.ErrorReportService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ErrorReportServiceImpl implements ErrorReportService {
    private final ErrorReportRepository errorReportRepository;

    @Override
    @Transactional
    public ErrorReportResponse createReport(ErrorReportRequest request, Long studentId) {
        String targetType = request.getTargetType().trim().toUpperCase();
        String description = request.getDescription().trim();

        // 1. KIỂM TRA TRÙNG LẶP: Chặn nếu học viên đã gửi báo cáo cho nội dung này và vẫn đang PENDING
        boolean isDuplicate = errorReportRepository.existsByStudentIdAndTargetTypeAndTargetIdAndStatus(
                studentId,
            targetType,
                request.getTargetId(),
                ReportStatus.PENDING
        );
        if (isDuplicate) {
            throw new RuntimeException("Bạn đã gửi một báo cáo cho nội dung này rồi. Vui lòng chờ quản trị viên xử lý!");
        }

        // 2. Nếu không trùng, tiến hành tạo mới
        ErrorReport report = ErrorReport.builder()
                .studentId(studentId)
                .targetType(targetType)
                .targetId(request.getTargetId())
                .description(description)
                .status(ReportStatus.PENDING)
                .build();

        ErrorReport savedReport = errorReportRepository.save(report);
        return mapToResponse(savedReport);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<ErrorReportResponse> getMyReports(Long studentId, Pageable pageable) {
        Page<ErrorReport> report = errorReportRepository.findByStudentId(studentId, pageable);
        return report.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ErrorReportResponse updateDescription(Long reportId, ErrorReportRequest request, Long studentId) {
        ErrorReport report = getAndValidateOwnership(reportId, studentId);
        if(report.getStatus() != ReportStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể sửa báo cáo khi đang ở trạng thái PENDING");
        }
        report.setDescription(request.getDescription().trim());

        ErrorReport updateReport = errorReportRepository.save(report);
        return mapToResponse(updateReport); // Sửa lại thành updateReport thay vì report
    }

    @Override
    public Page<ErrorReportResponse> getAllReports(String status, Pageable pageable) {
        Page<ErrorReport> reports;

        if (status != null && !status.trim().isEmpty()) {
            try {
                // CHUYỂN STRING SANG ENUM
                ReportStatus enumStatus = ReportStatus.valueOf(status.trim().toUpperCase());
                reports = errorReportRepository.findByStatus(enumStatus, pageable);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Trạng thái lọc không hợp lệ: " + status);
            }
        } else {
            reports = errorReportRepository.findAll(pageable);
        }

        return reports.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ErrorReportResponse updateReportStatus(Long reportId, String status, String reviewerNote, Long reviewerId) {
        // 1. Tìm báo cáo trong DB
        ErrorReport report = errorReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo lỗi với ID: " + reportId));

        // 2. Chuyển String sang Enum và cập nhật
        try {
            ReportStatus enumStatus = ReportStatus.valueOf(status.trim().toUpperCase());
            if (!isAllowedStatusTransition(report.getStatus(), enumStatus)) {
                throw new IllegalArgumentException("Chuyển trạng thái báo cáo không hợp lệ");
            }
            String note = trimToNull(reviewerNote);
            if ((enumStatus == ReportStatus.RESOLVED || enumStatus == ReportStatus.REJECTED) && note == null) {
                throw new IllegalArgumentException("Phải nhập phản hồi khi hoàn tất hoặc từ chối báo cáo");
            }
            report.setStatus(enumStatus);
            report.setReviewerNote(note);
            report.setReviewedBy(reviewerId);
            report.setReviewedAt(java.time.LocalDateTime.now());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái cập nhật không hợp lệ: " + status);
        }

        // 3. Lưu xuống DB
        errorReportRepository.save(report);

        return mapToResponse(report);
    }

    @Override
    @Transactional
    public void cancelReport(Long reportId, Long studentId) {
        ErrorReport report = getAndValidateOwnership(reportId, studentId);
        if(report.getStatus() != ReportStatus.PENDING){
            throw new RuntimeException("Chỉ có thể hủy báo cáo khi đang ở trạng thái PENDING");
        }
        report.setStatus(ReportStatus.CANCELLED);
        errorReportRepository.save(report);
    }

    private ErrorReport getAndValidateOwnership(Long reportId, Long studentId) {
        ErrorReport report = errorReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo lỗi (ID: " + reportId + ")"));

        if (!report.getStudentId().equals(studentId)) {
            throw new RuntimeException("Access Denied: Bạn không có quyền thao tác trên báo cáo của người khác.");
        }
        return report;
    }

    private ErrorReportResponse mapToResponse(ErrorReport report) {
        return ErrorReportResponse.builder()
                .reportId(report.getReportId())
                .studentId(report.getStudentId())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .description(report.getDescription())
                .status(report.getStatus())
                .reviewerNote(report.getReviewerNote())
                .reviewedBy(report.getReviewedBy())
                .reviewedAt(report.getReviewedAt())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }

    private boolean isAllowedStatusTransition(ReportStatus currentStatus, ReportStatus nextStatus) {
        return (currentStatus == ReportStatus.PENDING
                && (nextStatus == ReportStatus.IN_PROGRESS || nextStatus == ReportStatus.REJECTED))
                || (currentStatus == ReportStatus.IN_PROGRESS
                && (nextStatus == ReportStatus.RESOLVED || nextStatus == ReportStatus.REJECTED));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}