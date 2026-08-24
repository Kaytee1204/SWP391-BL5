package com.example.base.dto.vocabulary_category;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyItemDto {
    private Long itemId;
    private String wordJp;
    private String meaning;
}
