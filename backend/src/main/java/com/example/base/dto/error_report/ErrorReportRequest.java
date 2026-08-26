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
            regexp = "^(GRAMMAR|CULTURE_ARTICLE|KANJI|FLASHCARD)$",
            message = "Loại nội dung không hợp lệ"
    )
    private String targetType;

    @NotNull(message="ID nội dung không được để trống")
    @Positive(message = "ID nội dung phải lớn hơn 0")
    private Long targetId;

    @NotBlank(message = "Mô tả lỗi không được để trống")
    @Size(max=500, message = "Mô tả không được vượt quá 500 ký tự")
    @Pattern(regexp = "^[^\\p{Cntrl}<>]*$", message = "Mô tả chứa ký tự không hợp lệ")
    private String description;
}
