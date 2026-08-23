package com.example.base.dto.error_report;

import com.example.base.entity.ReportStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
public class ErrorReportResponse {

    private Long reportId;
    private Long studentId;
    private String targetType;
    private Long targetId;
    private String description;
    private ReportStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
