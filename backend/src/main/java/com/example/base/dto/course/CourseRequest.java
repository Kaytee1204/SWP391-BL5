package com.example.base.dto.course;

import com.example.base.entity.JlptLevel;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequest {

    @NotBlank(message = "Tên khóa học không được để trống")
    @Size(max = 200, message = "Tên khóa học không vượt quá 200 ký tự")
    private String title;

    @NotNull(message = "Cấp độ JLPT không được để trống")
    private JlptLevel jlptLevel;

    @Size(max = 200, message = "Mô tả khóa học không vượt quá 200 ký tự")
    private String description;

    @NotNull(message = "Giá khóa học không được để trống")
    @Min(value = 0, message = "Giá khóa học phải từ 0 VNĐ trở lên")
    @Max(value = 20000000, message = "Giá khóa học không được vượt quá 20.000.000 VNĐ")
    private Long price;
}
