package com.example.base.service.questionbank;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.questionbank.request.QuestionUpsertRequest;
import com.example.base.dto.questionbank.response.QuestionResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionSkillType;
import com.example.base.entity.QuestionType;
import com.example.base.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface QuestionBankService {

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
    );

    QuestionResponse updateQuestion(
            Long questionId,
            QuestionUpsertRequest request
    );

    void deleteQuestion(Long questionId);
}
