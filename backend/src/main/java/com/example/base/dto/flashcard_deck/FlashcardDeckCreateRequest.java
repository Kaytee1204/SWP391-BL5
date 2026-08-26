package com.example.base.dto.flashcard_deck;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
public class FlashcardDeckCreateRequest {

    @NotBlank(message = "Title is required and cannot be blank.")
    @Size(max = 150, message = "Title must not exceed 150 characters.")
        @Pattern(
            regexp = "^[\\p{L}\\p{N}]+(?:[ \\u00A0]+[\\p{L}\\p{N}]+)*$",
            message = "Title may contain only letters, numbers, and spaces."
        )
    private String title;

    @Size(max = 500, message = "Description must not exceed 500 characters.")
        @Pattern(regexp = "^[^\\p{Cntrl}]*$", message = "Description contains invalid control characters.")
    private String description;

}
