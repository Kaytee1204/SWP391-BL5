package com.example.base.dto.response;

import com.example.base.entity.JlptLevel;
import lombok.*;

import java.time.LocalDateTime;

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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}