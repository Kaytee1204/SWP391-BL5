package com.example.base.controller.questionbank;

import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.common.PageResponse;
import com.example.base.dto.questionbank.request.QuestionUpsertRequest;
import com.example.base.dto.questionbank.response.QuestionResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionSkillType;
import com.example.base.entity.QuestionType;
import com.example.base.security.UserPrincipal;
import com.example.base.service.questionbank.QuestionBankService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/question-bank")
@RequiredArgsConstructor
@PreAuthorize(
        "hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')"
)
public class QuestionBankController {

    private final QuestionBankService questionBankService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<QuestionResponse>>> getQuestions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false)QuestionSkillType skillType,
            @RequestParam(required = false)JlptLevel jlptLevel,
            @RequestParam(required = false)QuestionType questionType,
            @PageableDefault(
                    page=0,
                    size=10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )Pageable pageable
    ){
        PageResponse<QuestionResponse> response =
                questionBankService.searchQuestions(
                        keyword, skillType, jlptLevel, questionType, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestion(
            @PathVariable Long id
    ){
        return ResponseEntity.ok(
                ApiResponse.success(
                        questionBankService.getQuestionById(id)
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody QuestionUpsertRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
            ){
        QuestionResponse response =
                    questionBankService.createQuestion(request,currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Tạo câu hỏi thành công",
                        response
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionUpsertRequest request
    ){
        QuestionResponse response =
                questionBankService.updateQuestion(id,request);
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật câu hỏi thành công", response)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(
            @PathVariable Long id
    ){
        questionBankService.deleteQuestion(id);
        return ResponseEntity.ok(
                ApiResponse.success("Xóa câu hỏi thành công", null)
        );
    }
}
