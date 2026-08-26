package com.example.base.dto.error_report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
public class UpdateReportStatusRequest {
    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "^(IN_PROGRESS|RESOLVED|REJECTED)$", message = "Trạng thái cập nhật không hợp lệ")
    private String status;

    @Size(max = 500, message = "Phản hồi không được vượt quá 500 ký tự")
    @Pattern(regexp = "^[^\\p{Cntrl}<>]*$", message = "Phản hồi chứa ký tự không hợp lệ")
    private String reviewerNote;
}
