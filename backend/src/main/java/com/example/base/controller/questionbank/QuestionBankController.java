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
@RestController //đánh dấu class này là 1 rest controller, mọi method trả về sẽ thông qua json
// và ghi thằng vào response body, trả về json rồi trả về client

@RequestMapping("/question-bank") //api truy cập ngân hàng câu hỏi
@RequiredArgsConstructor //tự động sinh ra 1 constructor chứa tất cả các field được khai báo là final
@PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")

public class QuestionBankController {

    private final QuestionBankService questionBankService; // sinh ra constructor của questionbankservice ( vì được khai báo là final)

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<QuestionResponse>>> getQuestions( //trả về câu hỏi ( phục vụ tìm kiếm)
                                                                                     //responseEntity là wrapper của spring, cho phép kiểm soát http
            @RequestParam(required = false) String keyword, //lấy giá trị từ query parmeter
            @RequestParam(required = false)QuestionSkillType skillType,
            @RequestParam(required = false)JlptLevel jlptLevel,
            @RequestParam(required = false)QuestionType questionType,
            //set required = false vì người dùng có thể nhập 1 trong 4 cái để lọc.
            @PageableDefault(
                    page=0,
                    size=10,
                    sort = "questionId",
                    direction = Sort.Direction.DESC
            )Pageable pageable // phân trang.
    ){
        PageResponse<QuestionResponse> response =
                questionBankService.searchQuestions(
                        keyword, skillType, jlptLevel, questionType, pageable);
        return ResponseEntity.ok(ApiResponse.success(response)); // trả về frontend
        //reponse là dữ liệu phân trang
        //api đóng gói dữ liệu thành body có cấu trúc
        //reponseEntity check và đặt thành 200
    }
    //ApiResponse chuẩn hóa format json trả về cho mọi API trong hệ thống, để frontend luôn nhận được cấu trúc quen thuộc.
    //chuẩn hóa format json trả về cho mọi API là gì?

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
    //lấy theo id
    @PostMapping
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody QuestionUpsertRequest request, // phải nhập đúng form.
            @AuthenticationPrincipal UserPrincipal currentUser
            ){
        QuestionResponse response =
                    questionBankService.createQuestion(request,currentUser); //truyền vào yêu cầu tạo và người tạo.
        return ResponseEntity.status(HttpStatus.CREATED) //set ResponseEntity.status(create).
                .body(ApiResponse.success(
                        "Tạo câu hỏi thành công",
                        response
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionUpsertRequest request // nhập đúng form
    ){
        QuestionResponse response =
                questionBankService.updateQuestion(id,request);
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật câu hỏi thành công", response)
        );
    }
    //xóa theo id.
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
