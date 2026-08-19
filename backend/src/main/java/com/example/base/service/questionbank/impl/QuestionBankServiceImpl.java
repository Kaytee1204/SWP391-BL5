package com.example.base.service.questionbank.impl;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.questionbank.request.QuestionUpsertRequest;
import com.example.base.dto.questionbank.response.QuestionResponse;
import com.example.base.entity.*;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.QuestionBankMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.QuestionBankRepository;
import com.example.base.security.UserPrincipal;
import com.example.base.service.questionbank.QuestionBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;
@Service
@RequiredArgsConstructor
public class QuestionBankServiceImpl implements QuestionBankService {
    private final QuestionBankRepository questionBankRepository;
    private final AccountRepository accountRepository;
    private final QuestionBankMapper questionBankMapper;
//    Ba tham số:
//            - root: đại diện entity QuestionBank.
//            - query: câu query đang được xây dựng.
//            - cb: CriteriaBuilder, dùng tạo điều kiện SQL.
    @Override
    @Transactional(readOnly = true)
    public PageResponse<QuestionResponse> searchQuestions(String keyword, QuestionSkillType skillType, JlptLevel jlptLevel, QuestionType questionType, Pageable pageable) {
        Specification<QuestionBank> specification = (root, query, cb) ->{
            List<Predicate> predicates = new ArrayList<>();
            if(keyword !=null && !keyword.isBlank()){
                String pattern = "%" + keyword.trim().toLowerCase()+"%";
                Predicate questionMatches = cb.like(
                        cb.lower(root.get("questionText")),
                        pattern
                );

                Predicate explanationMatches = cb.like(
                        cb.lower(root.get("explanation")),
                        pattern
                );
                predicates.add(cb.or(questionMatches,explanationMatches));
            }
            if(skillType !=null){
                predicates.add(cb.equal(root.get("skillType"),skillType));
            }
            if(jlptLevel!=null){
                predicates.add(cb.equal(root.get("jlptLevel"),jlptLevel));
            }
            if(questionType !=null){
                predicates.add(cb.equal(root.get("questionType"),questionType));
            }
            return  cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<QuestionResponse> page = questionBankRepository
                .findAll(specification,pageable)
                .map(questionBankMapper::toResponse);
        return PageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionResponse getQuestionById(Long questionId) {
        QuestionBank question = findQuestion(questionId);
        return questionBankMapper.toResponse(question);
    }

    @Override
    @Transactional
    public QuestionResponse createQuestion(QuestionUpsertRequest request, UserPrincipal currentUser) {
        if(currentUser == null){
            throw new AppException(
                    ErrorCode.UNAUTHORIZED,
                    "Bạn cần đăng nhập để tạo câu hỏi"
            );
        }
        validateQuestion(request);
        Account creator = accountRepository.findById(currentUser.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account",
                        "id",
                        currentUser.getAccountId()
                ));
        QuestionBank question = questionBankMapper.toEntity(request,creator);
        QuestionBank saved = questionBankRepository.save(question);

        return questionBankMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public QuestionResponse updateQuestion(Long questionId, QuestionUpsertRequest request) {
        validateQuestion(request);

        QuestionBank question = findQuestion(questionId);
        questionBankMapper.updateEntity(request,question);

        QuestionBank saved = questionBankRepository.save(question);
        return questionBankMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long questionId) {
        QuestionBank question = findQuestion(questionId);

        questionBankRepository.delete(question);
    }

    private QuestionBank findQuestion(Long questionId){
        return questionBankRepository.findById(questionId)
                .orElseThrow(()-> new ResourceNotFoundException(
                        "QuestionBank",
                        "questionId",
                        questionId
                ));
    }

    private void validateQuestion(QuestionUpsertRequest request){
        List<String> answers = normalize(request.getCorrectAnswers());

        if(answers.isEmpty()){
            throw new AppException(
                    ErrorCode.BAD_REQUEST,
                    "Phải có ít nhất một đáp án đúng"
            );
        }

        if(request.getQuestionType()==QuestionType.multiple_choice){
            List<String>choices = normalize(request.getChoices());

            if(choices.size()<2){
                throw new AppException(
                        ErrorCode.BAD_REQUEST,
                        "Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn"
                );
            }
            if(!choices.containsAll(answers)){
                throw new AppException(
                        ErrorCode.BAD_REQUEST,
                        "Đáp án đúng phải nằm trong danh sách lựa chọn"
                );
            }
        }
    }

    private List<String> normalize(List<String>values){
        if(values==null){
            return  List.of();
        }

        return values.stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }
}
