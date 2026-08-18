package com.example.base.dto.culture;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Request DTO for updating an existing Japanese Culture Article")
public class CultureArticleUpdateRequest {

    @Size(max = 200, message = "Tiêu đề bài viết không được vượt quá 200 ký tự (khớp cấu trúc bảng CultureArticle.title)")
    @Schema(description = "Tiêu đề mới của bài viết", example = "Nghệ thuật giao tiếp Omotenashi (Cập nhật 2026)")
    private String title;

    @Schema(description = "Nội dung mới của bài viết (NVARCHAR(MAX))")
    private String content;

    @Size(max = 500, message = "Đường dẫn ảnh bìa không được vượt quá 500 ký tự (khớp cấu trúc bảng CultureArticle.cover_image_url)")
    @Schema(description = "URL ảnh bìa mới của bài viết", example = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e")
    private String coverImageUrl;

    @Size(max = 20, message = "Trạng thái bài viết không được vượt quá 20 ký tự (khớp cấu trúc bảng CultureArticle.status)")
    @Pattern(regexp = "^(published|draft|archived)?$", message = "Trạng thái bài viết chỉ có thể là: 'published', 'draft' hoặc 'archived'")
    @Schema(description = "Trạng thái mới của bài viết", example = "published")
    private String status;
}
