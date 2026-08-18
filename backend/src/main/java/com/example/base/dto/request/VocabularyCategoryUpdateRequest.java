package com.example.base.dto.request;

import com.example.base.entity.JlptLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

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