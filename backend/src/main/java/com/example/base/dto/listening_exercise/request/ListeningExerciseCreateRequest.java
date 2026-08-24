package com.example.base.dto.listening_exercise.request;

import com.example.base.entity.JlptLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ListeningExerciseCreateRequest {

    @NotNull(message = "JLPT level is required")
    private JlptLevel jlptLevel;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Listening script is required")
    private String scriptText;

    private String translation;
}
