package com.example.base.dto.course;

import com.example.base.entity.JlptLevel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    private String description;

    @NotNull(message = "Giá khóa học không được để trống")
    @Min(value = 0, message = "Giá khóa học phải từ 0 VNĐ trở lên")
    private Long price;
}
