package com.example.base.dto.vocabulary_category;

import com.example.base.entity.JlptLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Payload cập nhật chỉ chứa field được phép sửa; ID, creator và timestamp không nhận từ client. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyCategoryUpdateRequest {

    @NotNull(message = "JLPT level is required")
    private JlptLevel jlptLevel;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;
}
