package com.example.base.dto.grammar_example;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GrammarExampleRequest {

    @NotBlank(message = "Câu tiếng Nhật không được để trống")
    @Size(max = 150, message = "Câu tiếng Nhật không được vượt quá 150 ký tự")
    private String sentenceJp;

    @NotBlank(message = "Bản dịch không được để trống")
    @Size(max = 150, message = "Bản dịch không được vượt quá 150 ký tự")
    private String translation;

    @Size(max = 500, message = "Đường dẫn âm thanh không được vượt quá 500 ký tự")
    private String audioUrl;
}