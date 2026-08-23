package com.example.base.dto.error_report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
public class ErrorReportRequest {
    @NotBlank(message = "Loại nội dung không được để trống")
    private String targetType;
    @NotNull(message="ID nội dung không được để trống")
    private Long targetId;
    @NotBlank(message = "Mô tả lỗi không được để trống")
    @Size(max=500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;
}
