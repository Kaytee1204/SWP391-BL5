package com.example.base.service.questionbank;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.questionbank.request.QuestionUpsertRequest;
import com.example.base.dto.questionbank.response.QuestionResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionSkillType;
import com.example.base.entity.QuestionType;
import com.example.base.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface QuestionBankService { //xử lí nghiệp vụ

    PageResponse<QuestionResponse> searchQuestions(
            String keyword,
            QuestionSkillType skillType,
            JlptLevel jlptLevel,
            QuestionType questionType,
            Pageable pageable
    );

    QuestionResponse getQuestionById(Long questionId);

    QuestionResponse createQuestion(
            QuestionUpsertRequest request,
            UserPrincipal currentUser
    ); // yêu cầu và người dùng.

    QuestionResponse updateQuestion(
            Long questionId,
            QuestionUpsertRequest request
    ); //cần có id câu hỏi và yêu cầu điền đúng mẫu câu hỏi

    void deleteQuestion(Long questionId); // xóa theo id
}
