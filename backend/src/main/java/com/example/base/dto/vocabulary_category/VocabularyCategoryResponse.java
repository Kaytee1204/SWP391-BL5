package com.example.base.dto.vocabulary_category;

import java.time.LocalDateTime;

import com.example.base.entity.JlptLevel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response category đã được làm phẳng. createdByName và itemCount là dữ liệu tổng hợp,
 * giúp frontend dựng bảng mà không gọi thêm API account hoặc vocabulary item.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyCategoryResponse {

    private Long categoryId;
    private JlptLevel jlptLevel;
    private String name;
    private String description;
    private Long createdById;
    private String createdByName;
    private Integer itemCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
