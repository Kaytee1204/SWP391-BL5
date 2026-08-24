package com.example.base.dto.grammar_example;


import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarExampleResponse {
    private Long exampleId;
    private Long patternId;
    private String sentenceJp;
    private String translation;
    private String audioUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
