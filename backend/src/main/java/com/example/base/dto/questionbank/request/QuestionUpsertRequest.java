package com.example.base.dto.questionbank.request;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionSkillType;
import com.example.base.entity.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionUpsertRequest {
    @NotNull(message = "Kỹ năng không được để trống")
    private QuestionSkillType skillType;

    @NotNull(message = "Trình độ JLPT không được để trống")
    private JlptLevel jlptLevel;

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String questionText;

    @NotNull(message = "Loại câu hỏi không được để trống")
    private QuestionType questionType;

    /*
     * multiple_choice: tối thiểu 2 lựa chọn.
     * fill_blank: có thể để rỗng.
     */

    private List<String>choices; //choices dua ra list de chon nhieu hon 1 dap an

    @NotEmpty(message = "Phải có ít nhất một đáp án đúng")
    private List<@NotBlank(message = "Đáp án đúng không được để trống")String> correctAnswers;

    @Size(max = 5000, message = "Giải thích không được vượt quá 5000 ký tự")
    private String explanation;

}

//Khong de frontend gui truc tiep jpa
//thuc hien validation truoc khi du lieu di vao service
//chuyen choices va correctAnswer thanh mang JSON de su dung o frontend
