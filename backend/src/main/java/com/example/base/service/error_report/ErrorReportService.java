package com.example.base.service.error_report;

import com.example.base.dto.error_report.ErrorReportRequest;
import com.example.base.dto.error_report.ErrorReportResponse;
import com.example.base.entity.ErrorReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;


public interface ErrorReportService {
    ErrorReportResponse createReport(ErrorReportRequest request, Long studentId);

    Page<ErrorReportResponse> getMyReports(Long studentId, Pageable pageable);

    ErrorReportResponse updateDescription(Long reportId, ErrorReportRequest request, Long studentId);

    void cancelReport(Long reportId, Long studentId);
    Page<ErrorReportResponse> getAllReports(String status, Pageable pageable);
    ErrorReportResponse updateReportStatus(Long reportId, String status, String reviewerNote, Long reviewerId);
}