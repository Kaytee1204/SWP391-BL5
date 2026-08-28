package com.example.base.dto.culture;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for creating a new Japanese Culture Article")
public class CultureArticleCreateRequest {

    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    @Size(max = 200, message = "Tiêu đề bài viết không được vượt quá 200 ký tự")
    @Schema(description = "Tiêu đề bài viết văn hóa", example = "Nghệ thuật giao tiếp Omotenashi trong văn hóa Nhật Bản", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;

    @NotBlank(message = "Nội dung bài viết không được để trống")
    @Size(min = 10, max = 50000, message = "Nội dung bài viết phải có độ dài từ 10 đến 50.000 ký tự")
    @Schema(description = "Nội dung chi tiết bài viết (Hỗ trợ định dạng văn bản dài NVARCHAR(MAX))", example = "Omotenashi (おもてなし) là triết lý hiếu khách đỉnh cao của người Nhật...", requiredMode = Schema.RequiredMode.REQUIRED)
    private String content;

    @Size(max = 500, message = "Đường dẫn ảnh bìa không được vượt quá 500 ký tự")
    @Schema(description = "URL ảnh bìa đại diện của bài viết", example = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e")
    private String coverImageUrl;

    @Size(max = 20, message = "Trạng thái bài viết không được vượt quá 20 ký tự (khớp cấu trúc bảng CultureArticle.status)")
    @Pattern(regexp = "^(published|draft|archived)?$", message = "Trạng thái bài viết chỉ có thể là: 'published', 'draft' hoặc 'archived'")
    @Schema(description = "Trạng thái xuất bản bài viết", example = "published", defaultValue = "published")
    private String status;
}
