package com.example.base.dto.questionset.request;

import com.example.base.entity.QuestionSetPublicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionSetPublicationRequest {
    @NotNull(message = "Trạng thái xuất bản không được để trống")
    private QuestionSetPublicationStatus publicationStatus;
}
