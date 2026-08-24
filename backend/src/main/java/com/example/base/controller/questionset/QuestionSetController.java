package com.example.base.controller.questionset;

import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.common.PageResponse;
import com.example.base.dto.questionbank.request.QuestionUpsertRequest;
import com.example.base.dto.questionset.request.QuestionSetItemsReplaceRequest;
import com.example.base.dto.questionset.request.QuestionSetPublicationRequest;
import com.example.base.dto.questionset.request.QuestionSetUpsertRequest;
import com.example.base.dto.questionset.response.QuestionSetResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionSkillType;
import com.example.base.security.UserPrincipal;
import com.example.base.service.questionSet.QuestionSetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.aspectj.apache.bcel.Repository;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;



@RestController
@RequestMapping("/question-sets")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority("
        + "'Lecturer', 'ROLE_Lecturer',"
        + "'Manager', 'ROLE_Manager'"
        + ")")
public class QuestionSetController {

    private final QuestionSetService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<QuestionSetResponse>>> search(

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            QuestionSkillType skillType,

            @RequestParam(required = false)
            JlptLevel jlptLevel,

            @PageableDefault( page = 0,
                    size = 10,
                    sort = "questionSetId",
                    direction = Sort.Direction.ASC)
            Pageable pageable,

            @AuthenticationPrincipal
            UserPrincipal currentUser
    ){
        PageResponse<QuestionSetResponse> response =
                service.search(
                        keyword,
                        skillType,
                        jlptLevel,
                        pageable,
                        currentUser
                );
        return ResponseEntity.ok(
                ApiResponse.success(response)
        );

    }

    @GetMapping("/{setId}")
    public ResponseEntity<ApiResponse<QuestionSetResponse>> getById(
            @PathVariable Long setId,
            @AuthenticationPrincipal
            UserPrincipal currentUser
    ){
        return ResponseEntity.ok(ApiResponse.success(
                service.getById(setId,currentUser)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QuestionSetResponse>> create(
            @Valid @RequestBody
            QuestionSetUpsertRequest request,

            @AuthenticationPrincipal
            UserPrincipal currentUser
    ){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success("Tạo bộ câu hỏi thành công",
                                service.create(request,currentUser))
                );
    }

    @PutMapping("/{setId}")

    public ResponseEntity<ApiResponse<QuestionSetResponse>>update(
            @PathVariable Long setId,

            @Valid @RequestBody
            QuestionSetUpsertRequest request,

            @AuthenticationPrincipal
            UserPrincipal currentUser
    ){
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật bộ câu hỏi thành công",
                service.update(
                        setId,
                        request,
                        currentUser
                )
        ));
    }

    @PutMapping("/{setId}/questions")
    public ResponseEntity<ApiResponse<QuestionSetResponse>> replaceQuestions(
            @PathVariable Long setId,

            @Valid @RequestBody
            QuestionSetItemsReplaceRequest request,

            @AuthenticationPrincipal
            UserPrincipal currentUser
    ){
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật danh sách câu hỏi thành công",
                service.replaceQuestions(
                        setId,
                        request,
                        currentUser
                )
        ));
    }

    @DeleteMapping("/{setId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long setId,
            @AuthenticationPrincipal
            UserPrincipal currentUser
    ){
        service.delete(setId,currentUser);
        return ResponseEntity.ok(ApiResponse.success(
                "Xóa bộ câu hỏi thành công",
                null
        ));
    }

    @PostMapping("/{setId}/questions")
    public ResponseEntity<ApiResponse<QuestionSetResponse>> createQuestionInsideset(
            @PathVariable Long setId,
            @Valid @RequestBody QuestionUpsertRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Tạo và thêm câu hỏi vào bộ thành công",
                        service.createQuestionInsideSet(
                                setId,
                                request,
                                currentUser
                        )
                ));
    }

    @PatchMapping("/{setId}/publication")
    public ResponseEntity<ApiResponse<QuestionSetResponse>> changePublicationStatus(
            @PathVariable Long setId,
            @Valid @RequestBody QuestionSetPublicationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Cập nhật trạng thái chia sẻ thành công",
                        service.changePublicationStatus(setId,request, currentUser)
                )
        );
    }
}
