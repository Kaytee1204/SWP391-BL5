package com.example.base.dto.error_report;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
public class UpdateReportStatusRequest {
    @NotBlank(message = "Trạng thái không được để trống")
    private String status;
}
