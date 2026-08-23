package com.example.base.service.questionSet;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.questionbank.request.QuestionUpsertRequest;
import com.example.base.dto.questionset.request.QuestionSetItemsReplaceRequest;
import com.example.base.dto.questionset.request.QuestionSetUpsertRequest;
import com.example.base.dto.questionset.response.QuestionSetResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionSet;
import com.example.base.entity.QuestionSkillType;
import com.example.base.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface QuestionSetService {
    PageResponse<QuestionSetResponse> search(
            String keyword,
            QuestionSkillType skillType,
            JlptLevel jlptLevel,
            Pageable pageable,
            UserPrincipal currentUser
    );

    QuestionSetResponse getById(Long setId, UserPrincipal currentUser);

    QuestionSetResponse create(
            QuestionSetUpsertRequest request,
            UserPrincipal currentUser
    );

    QuestionSetResponse update(
            Long setId,
            QuestionSetUpsertRequest request,
            UserPrincipal currentUser
    );

    QuestionSetResponse replaceQuestions(
            Long setId,
            QuestionSetItemsReplaceRequest request,
            UserPrincipal currentUser
    );

    void delete(
            Long setId,
            UserPrincipal currentUser
    );

    QuestionSetResponse createQuestionInsideSet(Long setId, QuestionUpsertRequest request, UserPrincipal currentUser);
}
