package com.example.base.dto.culture;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CultureArticleUpdateRequest {

    private String title;

    private String content;

    private String coverImageUrl;

    private String status;
}
