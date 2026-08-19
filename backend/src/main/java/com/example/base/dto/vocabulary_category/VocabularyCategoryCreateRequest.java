package com.example.base.dto.vocabulary_category;

import com.example.base.entity.JlptLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyCategoryCreateRequest {

    @NotNull(message = "JLPT level is required")
    private JlptLevel jlptLevel;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Lecturer ID is required")
    private Long createdById; 
}