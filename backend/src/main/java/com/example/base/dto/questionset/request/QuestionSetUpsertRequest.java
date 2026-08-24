package com.example.base.dto.questionset.request;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionSkillType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;

@Data
public class QuestionSetUpsertRequest {

    @NotBlank(
            message = "Tên bộ câu hỏi không được để trống"
    )
    @Size(
            max = 200,
            message = "Tên bộ câu hỏi không được vượt quá 200 ký tự"
    )
    private String title;

    @Size(
            max = 1000,
            message = "Mô tả không được vượt quá 1000 ký tự"
    )
    private String description;

    @NotNull(
            message = "Kỹ năng không được để trống"
    )
    private QuestionSkillType skillType;

    @NotNull(
            message = "Level không được để trống"
    )
    private JlptLevel jlptLevel;

    @Min(value = 1, message = "Thời lượng tối thiểu là 1 phút")
    @Max(value = 300, message = "Thời lượng tối đa là 300 phút")
    private Integer durationMinutes = 60;
}
