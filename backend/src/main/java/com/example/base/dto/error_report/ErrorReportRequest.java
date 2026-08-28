package com.example.base.dto.error_report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
public class ErrorReportRequest {
    @NotBlank(message = "Loại nội dung không được để trống")
    @Pattern(
            regexp = "(?i)^(GRAMMAR|CULTURE_ARTICLE|KANJI|FLASHCARD|VOCABULARY|VOCAB|EXERCISE|QUESTION|COURSE|READING|LISTENING|GENERAL)$",
            message = "Loại nội dung không hợp lệ"
    )
    private String targetType;

    @NotNull(message="ID nội dung không được để trống")
    @Positive(message = "ID nội dung phải lớn hơn 0")
    private Long targetId;

    @NotBlank(message = "Mô tả lỗi không được để trống")
    @Size(min = 1, max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
    private String description;
}

