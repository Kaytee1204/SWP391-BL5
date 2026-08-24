package com.example.base.dto.questionset.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
@Data
public class QuestionSetItemsReplaceRequest {
    private List<
                @NotNull(message = "Question ID không hợp lệ")
                        Long
                > questionIds;
}
