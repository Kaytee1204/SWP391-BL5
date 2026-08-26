package com.example.base.dto.vocabulary_category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
public class VocabularyItemDto {
    private Long itemId;

    @NotBlank(message = "Japanese word is required")
    @Size(max = 100, message = "Japanese word must not exceed 100 characters")
    @Pattern(
            regexp = "^[\\p{sc=Hiragana}\\p{sc=Katakana}\\p{IsHan}々ー・]+$",
            message = "Japanese word may contain only Hiragana, Katakana, and Kanji characters"
    )
    private String wordJp;

    @NotBlank(message = "Meaning is required")
    @Size(max = 500, message = "Meaning must not exceed 500 characters")
    @Pattern(
            regexp = "^[^\\p{Cntrl}]*$",
            message = "Meaning contains invalid control characters"
    )
    private String meaning;
}
