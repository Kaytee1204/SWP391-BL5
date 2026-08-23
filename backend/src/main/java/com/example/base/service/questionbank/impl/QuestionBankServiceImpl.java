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
import com.example.base.repository.QuestionSetItemRepository;
import com.example.base.security.UserPrincipal;
import com.example.base.service.questionbank.QuestionBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import com.example.base.service.questionbank.QuestionDuplicateHashGenerator;
import  org.springframework.dao.DataIntegrityViolationException;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import jakarta.persistence.criteria.Predicate;
@Service
@RequiredArgsConstructor
public class QuestionBankServiceImpl implements QuestionBankService {
    private final QuestionBankRepository questionBankRepository;
    private final AccountRepository accountRepository;
    private final QuestionBankMapper questionBankMapper;
    private final QuestionDuplicateHashGenerator duplicateHashGenerator;

    public final QuestionSetItemRepository questionSetItemRepository;
//    Ba tham số:
//            - root: đại diện entity QuestionBank.
//            - query: câu query đang được xây dựng.
//            - cb: CriteriaBuilder, dùng tạo điều kiện SQL.
    @Override
    @Transactional(readOnly = true) //không thực hiện chỉnh sửa db, chỉ xem
    public PageResponse<QuestionResponse> searchQuestions(String keyword, QuestionSkillType skillType, JlptLevel jlptLevel, QuestionType questionType, Pageable pageable) {
        Specification<QuestionBank> specification = (root, query, cb) ->{

            List<Predicate> predicates = new ArrayList<>(); // danh sách chứa các điều kiện WHERE sẽ áp dụng
            if(keyword !=null && !keyword.isBlank()){
                String pattern = "%" + keyword.trim().toLowerCase()+"%"; //tạo pattern để so khớp LIKE (không phân biệt hoa/thường, khớp bất kỳ vị trí nào)
                Predicate questionMatches = cb.like(
                        cb.lower(root.get("questionText")), //lấy cột questionText, chuyển về chữ thường để phân biệt hoa thường
                        pattern // input
                );

                Predicate explanationMatches = cb.like(
                        cb.lower(root.get("explanation")),
                        pattern //lấy phần giải thích
                );
                predicates.add(cb.or(questionMatches,explanationMatches)); // thêm điều kiện (questionText khớp HOẶC explanation khớp) vào danh sách predicate
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
            return  cb.and(predicates.toArray(new Predicate[0]));// gộp tất cả predicate trong list lại bằng AND, trả về 1 điều kiện WHERE tổng hợp
        };

        Page<QuestionResponse> page = questionBankRepository
                .findAll(specification,pageable)//tìm tất cả theo phân trang và điều kiện
                .map(questionBankMapper::toResponse); //convert từng Entity (QuestionBank) sang DTO (QuestionResponse)

        return PageResponse.from(page); // lấy entity từ page.
    }

    @Override
    @Transactional(readOnly = true) // chỉ đọc
    public QuestionResponse getQuestionById(Long questionId) {
        QuestionBank question = findQuestion(questionId); //tìm theo id
        return questionBankMapper.toResponse(question); // nhận vào entity và trả về json gửi lên client
    }

    @Override
    @Transactional
    public QuestionResponse createQuestion(QuestionUpsertRequest request, UserPrincipal currentUser) { //cần truyền vào request và người up
        if(currentUser == null){
            throw new AppException(
                    ErrorCode.UNAUTHORIZED, // guard clause: chặn ngay nếu chưa đăng nhập (currentUser null), ném lỗi 401
                    "Bạn cần đăng nhập để tạo câu hỏi"
            );
        }
        validateQuestion(request); //kiểm tra business rule của câu hỏi (không chỉ format, còn cả logic nghiệp vụ)
        String duplicateHash = duplicateHashGenerator.generate(request);
        if(questionBankRepository.existsByDuplicateHash(duplicateHash)){
            throw  new AppException(
                    ErrorCode.QUESTION_ALREADY_EXISTS,"Câu hỏi có cùng nội dung đã tồn tại"
            );
        }
        Account creator = accountRepository.findById(currentUser.getAccountId()) //lấy id người dùng ra để kiểm tra
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account",
                        "id",
                        currentUser.getAccountId()
                ));
        QuestionBank question = questionBankMapper.toEntity(request,creator); // json sang entity
        question.setDuplicateHash(duplicateHash);
        QuestionBank saved = saveWithDuplicateHandling(question); //lưu xuống DB (INSERT vì là entity mới), nhận lại entity đã có id

        return questionBankMapper.toResponse(saved); //convert Entity đã lưu thành DTO để trả về Controller
    }

    @Override
    @Transactional
    public QuestionResponse updateQuestion(Long questionId, QuestionUpsertRequest request) {
        validateQuestion(request);//validate input

        QuestionBank question = findQuestion(questionId); //tìm câu hỏi theo id
        String duplicateHash = duplicateHashGenerator.generate(request);
        boolean duplicateExists = questionBankRepository.existsByDuplicateHashAndQuestionIdNot(duplicateHash,questionId);
        if(duplicateExists){
            throw new AppException(
                    ErrorCode.QUESTION_ALREADY_EXISTS,"Một câu hỏi khác có cùng nội dung đã tồn tại"
            );
        }
        questionBankMapper.updateEntity(request,question); //update entity, cần truyền vào yêu cầu và câu hỏi
        question.setDuplicateHash(duplicateHash);
        QuestionBank saved = saveWithDuplicateHandling(question); //dùng dto lưu xuống db
        return questionBankMapper.toResponse(saved); //convert Entity đã lưu thành DTO để trả về Controller
    }

    private QuestionBank saveWithDuplicateHandling(QuestionBank question){
        try {
            return questionBankRepository.saveAndFlush(question); //lưu xuống db ngay lập tức thay vì chờ đến cuối.
        }catch (DataIntegrityViolationException exception){
            if(isDuplicateHashViolationException(exception)){
                throw new AppException(ErrorCode.QUESTION_ALREADY_EXISTS,"Câu hỏi có cùng nội dung và đáp án đã tồn tại");
            }
            throw exception;
        }

    }

    private boolean isDuplicateHashViolationException(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            String message = current.getMessage();
            if (message != null && message.toLowerCase().contains("ux_questionbank_duplicatehash")) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    @Override
    @Transactional
    public void deleteQuestion(Long questionId) {
        QuestionBank question = findQuestion(questionId); // tìm theo id

        boolean isUsed = questionSetItemRepository.existsByQuestionQuestionId(questionId);

        if(isUsed){
            throw new AppException(
                    ErrorCode.CONFLICT,
                    "Không thể xóa câu hỏi đang được sử dụng trong bộ câu hỏi"
            );
        }
        questionBankRepository.delete(question); // dùng dto xóa
    }

    private QuestionBank findQuestion(Long questionId){
        return questionBankRepository.findById(questionId) // dùng jpa để tìm trong db
                .orElseThrow(()-> new ResourceNotFoundException(
                        "QuestionBank",
                        "questionId",
                        questionId // ném về ngoại lệ
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
        boolean isChoiceQuestion = request.getQuestionType() == QuestionType.multiple_choice
                || request.getQuestionType() == QuestionType.multiple_select;

        if(isChoiceQuestion){
            List<String> choices = request.getChoices() == null // kiểm tra null
                    ? List.of() // null thì trả về chuỗi rỗng
                    : request.getChoices().stream() //chuyển lựa chọn thành luồng dữ liệu
                    .map(String::trim) // chuẩn hóa từng lựa chọn xóa bỏ khoảng trắng đầu cuối
                    .filter(value -> !value.isBlank()) //lọc các phần tử rỗng hoặc blank
                    .toList(); // đưa vào list

            if(choices.size()<2){
                throw new AppException(
                        ErrorCode.BAD_REQUEST,
                        "Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn"
                );
            }
            List<String> nomalizedChoices = choices.stream().map(this::normalizeComparable).toList();
            //chuyển thành luồng dữ liệu, sau đó chuẩn hóa và đưa vào list sau khi chuẩn hóa
            long uniqueChoiceCount = nomalizedChoices.stream().distinct().count(); //đếm các lựa chọn có nội dung khác nhau
            if(uniqueChoiceCount != choices.size()){
                throw new AppException(
                        ErrorCode.BAD_REQUEST,"Các lựa chọn đáp án không được trùng nội dung"
                );
            }

            //biến cờ để kiểm tra đáp án phải trong danh sách lựa chọn
            boolean allAnswersBelongToChoices = answers.stream().map(this::normalizeComparable).allMatch(nomalizedChoices::contains);
            if(!allAnswersBelongToChoices){
                throw new AppException(
                        ErrorCode.BAD_REQUEST,
                        "Tất cả đáp án đúng phải nằm trong danh sách lựa chọn"
                );
            }
        }
        if (request.getQuestionType()
                == QuestionType.multiple_choice
                && answers.size() != 1) {

            throw new AppException(
                    ErrorCode.BAD_REQUEST,
                    "Câu hỏi chọn một phải có đúng một đáp án đúng"
            );
        }

        if (request.getQuestionType()
                == QuestionType.multiple_select
                && answers.size() < 2) {

            throw new AppException(
                    ErrorCode.BAD_REQUEST,
                    "Câu hỏi chọn nhiều phải có ít nhất 2 đáp án đúng"
            );
        }
    }


    //lọc
    private List<String> normalize(List<String>values){
        if(values==null){
            return List.of();
        }

        return values.stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }

    //chuẩn hóa về 1 dạng chung
    private String normalizeComparable(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(
                        value,
                        Normalizer.Form.NFKC
                )
                .replaceAll("[\\p{Z}\\s]+", " ")
                .trim()
                .toLowerCase(Locale.ROOT);
    }


}
