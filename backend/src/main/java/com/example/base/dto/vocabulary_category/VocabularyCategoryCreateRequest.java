package com.example.base.dto.vocabulary_category;

import com.example.base.entity.JlptLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Dữ liệu frontend gửi khi tạo category. Validation chạy tại controller trước khi vào service;
 * createdById chỉ giữ để tương thích client cũ, backend dùng accountId từ JWT thay giá trị này.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyCategoryCreateRequest {

    @NotNull(message = "JLPT level is required")
    private JlptLevel jlptLevel;

    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String name;


    private String description;

    private Long createdById;
}
