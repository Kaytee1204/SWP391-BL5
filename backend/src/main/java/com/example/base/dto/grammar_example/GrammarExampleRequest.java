package com.example.base.dto.grammar_example;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GrammarExampleRequest {

    @NotBlank(message = "Câu tiếng Nhật không được để trống")
    @Size(max = 150, message = "Câu tiếng Nhật không được vượt quá 150 ký tự")
    @Pattern(regexp = "^[^\\p{Cntrl}<>]*$", message = "Câu tiếng Nhật chứa ký tự không hợp lệ")
    private String sentenceJp;

    @NotBlank(message = "Bản dịch không được để trống")
    @Size(max = 150, message = "Bản dịch không được vượt quá 150 ký tự")
    @Pattern(regexp = "^[^\\p{Cntrl}<>]*$", message = "Bản dịch chứa ký tự không hợp lệ")
    private String translation;

    @Size(max = 500, message = "Đường dẫn âm thanh không được vượt quá 500 ký tự")
    @Pattern(
            regexp = "^(?:$|https?://[^\\s<>]+)$",
            message = "Đường dẫn âm thanh phải là URL http hoặc https hợp lệ"
    )
    private String audioUrl;
}