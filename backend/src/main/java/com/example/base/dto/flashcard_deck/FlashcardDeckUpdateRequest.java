package com.example.base.dto.flashcard_deck;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class FlashcardDeckUpdateRequest {

    @NotBlank(message = "Title is required and cannot be blank.")
    @Size(max = 150, message = "Title must not exceed 150 characters.")
    private String title;

    @Size(max = 500, message = "Description must not exceed 500 characters.")
    private String description;
}
