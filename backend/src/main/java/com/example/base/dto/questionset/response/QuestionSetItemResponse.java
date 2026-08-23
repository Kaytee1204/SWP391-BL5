package com.example.base.dto.questionset.response;

import com.example.base.dto.questionbank.response.QuestionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionSetItemResponse {
    private Long questionSetItemId;
    private Integer questionOrder;
    private QuestionResponse question;
}
