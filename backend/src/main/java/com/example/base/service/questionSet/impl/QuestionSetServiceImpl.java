package com.example.base.service.questionSet.impl;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.questionbank.request.QuestionUpsertRequest;
import com.example.base.dto.questionbank.response.QuestionResponse;
import com.example.base.dto.questionset.request.QuestionSetItemsReplaceRequest;
import com.example.base.dto.questionset.request.QuestionSetPublicationRequest;
import com.example.base.dto.questionset.request.QuestionSetUpsertRequest;
import com.example.base.dto.questionset.response.QuestionSetResponse;
import com.example.base.entity.*;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.QuestionSetMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.QuestionBankRepository;
import com.example.base.repository.QuestionSetItemRepository;
import com.example.base.repository.QuestionSetRepository;
import com.example.base.security.UserPrincipal;
import com.example.base.service.questionSet.QuestionSetService;
import com.example.base.service.questionbank.QuestionBankService;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import jakarta.persistence.criteria.Predicate;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionSetServiceImpl implements QuestionSetService {

    private final QuestionSetRepository questionSetRepository;
    private final AccountRepository accountRepository;
    private final QuestionSetMapper mapper;
    private final QuestionSetItemRepository questionSetItemRepository;
    private final QuestionBankRepository questionBankRepository;
    private final QuestionBankService questionBankService;

    @Override
    public PageResponse<QuestionSetResponse> search(String keyword, QuestionSkillType skillType, JlptLevel jlptLevel, Pageable pageable, UserPrincipal currentUser) {
        if(currentUser == null) {
            throw new AppException(
                    ErrorCode.UNAUTHORIZED, "Bạn cần đăng nhập để xem bộ câu hỏi"
            );
        }

            Specification<QuestionSet> specification = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();

                /*
                 * Tìm kiếm theo title hoặc description.
                 */
                if(keyword !=null && !keyword.isBlank()){
                    String pattern = "%" +keyword.trim().toLowerCase(Locale.ROOT)+"%";
                    Predicate titleMatches = cb.like(
                            cb.lower(root.get("title")),pattern
                    );
                    Predicate descriptionMatches = cb.like(
                            cb.lower(root.get("description")),pattern
                    );

                    predicates.add(cb.or(titleMatches,descriptionMatches));

                }
                if(skillType!=null){
                    predicates.add(cb.equal(root.get("skillType"),skillType));
                }

                if(jlptLevel!=null){
                    predicates.add(cb.equal(root.get("jlptLevel"),jlptLevel));
                }
                return cb.and(
                        predicates.toArray(
                                new Predicate[0]
                        )
                );
            };
        Page<QuestionSetResponse> responsePage = questionSetRepository
                .findAll(specification,pageable)
                .map(questionSet -> {
                    long questionCount =
                            questionSetItemRepository
                                    .countByQuestionSetQuestionSetId(
                                            questionSet.getQuestionSetId()
                                    );

                    return mapper.toSummaryResponse(
                            questionSet,
                            questionCount
                    );
                });
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionSetResponse getById(Long setId, UserPrincipal currentUser) {
        QuestionSet set = findSharedSet(setId, currentUser);
        List<QuestionSetItem> items =
                questionSetItemRepository.findByQuestionSetQuestionSetIdOrderByQuestionOrderAsc(setId);

        return mapper.toResponse(set,items);
    }

    @Override
    @Transactional
    public QuestionSetResponse create(QuestionSetUpsertRequest request, UserPrincipal currentUser) {
        Account creator = accountRepository.findById(currentUser.getAccountId())
                .orElseThrow(()->
                        new ResourceNotFoundException("Account", "accountId",currentUser.getAccountId()));


        QuestionSet entity = mapper.toEntity(request,creator);
        QuestionSet saved = questionSetRepository.save(entity);
        return mapper.toResponse(saved, List.of());
    }

    @Override
    @Transactional
    public QuestionSetResponse update(Long setId, QuestionSetUpsertRequest  request, UserPrincipal currentUser) {
        QuestionSet set = findOwnedSet(setId, currentUser);

        long questionCount = questionSetItemRepository.countByQuestionSetQuestionSetId(setId);

        boolean levelChanged = set.getJlptLevel() != request.getJlptLevel();
        boolean changedToSingleSkill = set.getSkillType() != request.getSkillType()
                && request.getSkillType() != QuestionSkillType.mixed;
        if((levelChanged || changedToSingleSkill) && questionCount > 0){
            throw new AppException(
                    ErrorCode.CONFLICT, "Không thể đổi skill hoặc level khi bộ câu hỏi đã có câu hỏi"
            );
        }
        mapper.updateEntity(request,set);

        QuestionSet saved = questionSetRepository.save(set);

        List<QuestionSetItem> items = questionSetItemRepository.findByQuestionSetQuestionSetIdOrderByQuestionOrderAsc(setId);

        return mapper.toResponse(saved,items);
    }



    @Override
    @Transactional
    public QuestionSetResponse replaceQuestions(Long setId, QuestionSetItemsReplaceRequest request, UserPrincipal currentUser) {
        QuestionSet set = findSharedSet(setId, currentUser);
        List<Long> questionIds = request.getQuestionIds() ==null ? List.of() : request.getQuestionIds();

        long uniqueCount = questionIds.stream().distinct().count();

        if(uniqueCount != questionIds.size()){
            throw new AppException(
                    ErrorCode.BAD_REQUEST,"Một câu hỏi không được xuất hiện hai lần trong cùng bộ"
            );
        }

        List<QuestionBank> questions = questionBankRepository.findAllById(questionIds);

        if(questions.size() != questionIds.size()){
            throw new AppException(
                    ErrorCode.BAD_REQUEST,"Một hoặc nhiều câu hỏi không tồn tại"
            );
        }

        Map<Long, QuestionBank> questionMap = questions.stream()
                .collect(Collectors.toMap(QuestionBank :: getQuestionId,
                        question -> question));

        List<QuestionSetItem> newItems = new ArrayList<>();

        for(int idx = 0; idx < questionIds.size(); idx ++){
            Long questionId = questionIds.get(idx);
            QuestionBank question = questionMap.get(questionId);

            if(set.getSkillType() != QuestionSkillType.mixed
                    && question.getSkillType()!=set.getSkillType()){
                throw new AppException(
                        ErrorCode.BAD_REQUEST,"Câu hỏi #" + questionId
                        + " không cùng kỹ năng với bộ câu hỏi"
                );
            }

            if(question.getJlptLevel()!=set.getJlptLevel()){
                throw new AppException(
                        ErrorCode.BAD_REQUEST,
                        "Câu hỏi #" + questionId
                                + " không cùng level với bộ câu hỏi"
                );
            }

            newItems.add(QuestionSetItem.builder()
                    .questionSet(set)
                    .question(question)
                    .questionOrder(idx+1)
                    .build());
        }
        questionSetItemRepository.deleteByQuestionSetQuestionSetId(setId);
        questionSetItemRepository.flush();
        questionSetItemRepository.saveAll(newItems);
        questionSetItemRepository.flush();

        return mapper.toResponse(set,newItems);
    }

    @Override
    @Transactional
    public QuestionSetResponse changePublicationStatus(
            Long setId,
            QuestionSetPublicationRequest request,
            UserPrincipal currentUser
    ) {
        // findOwnedSet chỉ cho chủ đề hoặc Manager thao tác
        QuestionSet set = findOwnedSet(setId, currentUser);

        set.setPublicationStatus(request.getPublicationStatus());
        QuestionSet saved = questionSetRepository.save(set);

        List<QuestionSetItem> items =
                questionSetItemRepository
                        .findByQuestionSetQuestionSetIdOrderByQuestionOrderAsc(setId);

        return mapper.toResponse(saved, items);
    }

    @Override
    public void delete(Long setId, UserPrincipal currentUser) {
        QuestionSet set = findOwnedSet(setId,currentUser);
        questionSetRepository.delete(set);

    }


    @Override
    @Transactional
    public QuestionSetResponse createQuestionInsideSet(Long setId, QuestionUpsertRequest request, UserPrincipal currentUser){
        QuestionSet set = findSharedSet(setId, currentUser);
        if (set.getSkillType() != QuestionSkillType.mixed) {
            request.setSkillType(set.getSkillType());
        }
        request.setJlptLevel(set.getJlptLevel());

        QuestionResponse createdQuestion = questionBankService.createQuestion(request,currentUser);
        QuestionBank question = questionBankRepository.findById(createdQuestion.getQuestionId()).orElseThrow();

        int nextOrder = Math.toIntExact(questionSetItemRepository.countByQuestionSetQuestionSetId(setId)+1);
        questionSetItemRepository.save(QuestionSetItem.builder()
                .questionSet(set)
                .question(question)
                .questionOrder(nextOrder)
                .build());

        List<QuestionSetItem> items = questionSetItemRepository.findByQuestionSetQuestionSetIdOrderByQuestionOrderAsc(setId);

        return mapper.toResponse(set,items);
    }

    private boolean isManager(UserPrincipal currentUser){
        return currentUser.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch(authority -> authority.equalsIgnoreCase("Manager")
                || authority.equalsIgnoreCase("ROLE_Manager"));
    }

    private QuestionSet findOwnedSet(Long setId, UserPrincipal currentUser){
        QuestionSet set = questionSetRepository.findById(setId).orElseThrow(
                () -> new ResourceNotFoundException("QuestionSet", "questionSetId",setId)
        );
        boolean isOwner = set.getCreateBy().getAccountId().equals(currentUser.getAccountId());
        if (!isOwner && !isManager(currentUser)) {
            throw new AppException(
                    ErrorCode.FORBIDDEN, "Bạn không có quyền quản lý bộ câu hỏi này"
            );


        }
        return set;
    }

    private QuestionSet findSharedSet(
            Long setId,
            UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            throw new AppException(
                    ErrorCode.UNAUTHORIZED,
                    "Bạn cần đăng nhập để xem bộ câu hỏi"
            );
        }
        QuestionSet set = questionSetRepository
                .findById(setId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "QuestionSet",
                        "questionSetId",
                        setId
                ));
        boolean owner = set.getCreateBy()
                .getAccountId()
                .equals(currentUser.getAccountId());

        boolean sharedWithLecturer =
                isLecturer(currentUser)
                        && set.getPublicationStatus() == QuestionSetPublicationStatus.PUBLISHED;

        boolean canAccess =
                isManager(currentUser)
                        || owner
                        || sharedWithLecturer;

        if (!canAccess) {
            throw new AppException(
                    ErrorCode.FORBIDDEN,
                    "Bộ câu hỏi này đang ở trạng thái riêng tư"
            );
        }

      return set;
    }

    private boolean isLecturer(
            UserPrincipal currentUser
    ) {
        return currentUser.getAuthorities()
                .stream()
                .map(authority ->
                        authority.getAuthority()
                )
                .anyMatch(authority ->
                        authority.equalsIgnoreCase("Lecturer")
                                || authority.equalsIgnoreCase(
                                "ROLE_Lecturer"
                        )
                );
    }
}


