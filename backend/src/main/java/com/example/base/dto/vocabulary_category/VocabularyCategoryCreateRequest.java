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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyCategoryCreateRequest {

    @NotNull(message = "JLPT level is required")
    private JlptLevel jlptLevel;

    @NotBlank(message = "Name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
        @jakarta.validation.constraints.Pattern(
            regexp = "^[\\p{L}\\p{N}]+(?:[ \\u00A0]+[\\p{L}\\p{N}]+)*$",
            message = "Name may contain only letters, numbers, and spaces"
        )
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    
    private Long createdById;
}