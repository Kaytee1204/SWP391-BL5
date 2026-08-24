package com.example.base.dto.listening_exercise.response;

import com.example.base.entity.JlptLevel;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListeningExerciseResponse {
    private Long listeningExerciseId;
    private JlptLevel jlptLevel;
    private String title;
    private String audioUrl;
    private String audioOriginalName;
    private String scriptText;
    private String translation;
    private Long createdById;
    private String createdByName;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
