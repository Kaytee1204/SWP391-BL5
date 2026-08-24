package com.example.base.service.grammar.impl;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.exercise.GrammarExerciseCreateRequest;
import com.example.base.dto.exercise.GrammarExerciseResponse;
import com.example.base.dto.exercise.GrammarExerciseUpdateRequest;
import com.example.base.entity.Account;
import com.example.base.entity.GrammarExercise;
import com.example.base.entity.JlptLevel;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.GrammarExerciseMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.GrammarExerciseRepository;
import com.example.base.security.UserPrincipal;
import com.example.base.service.grammar.GrammarExerciseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GrammarExerciseServiceImpl implements GrammarExerciseService {

    private final GrammarExerciseRepository grammarExerciseRepository;
    private final AccountRepository accountRepository;
    private final GrammarExerciseMapper grammarExerciseMapper;

    // 1. TÌM KIẾM & XEM BÀI TẬP (Chỉ dành cho Student, Lecturer, Manager đã đăng nhập)
    @Override
    @Transactional(readOnly = true)
    public PageResponse<GrammarExerciseResponse> searchExercises(String keyword, JlptLevel jlptLevel, Pageable pageable) {
        log.info("Searching grammar exercises: keyword='{}', jlptLevel={}", keyword, jlptLevel);

        Page<GrammarExercise> page = grammarExerciseRepository.searchExercises(keyword, jlptLevel, pageable);

        return PageResponse.from(page.map(grammarExerciseMapper::toResponse));
    }

    // 2. GIẢNG VIÊN XEM BÀI TẬP DO CHÍNH MÌNH TẠO
    @Override
    @Transactional(readOnly = true)
    public PageResponse<GrammarExerciseResponse> searchMyExercises(String keyword, JlptLevel jlptLevel, UserPrincipal currentUser, Pageable pageable) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để xem bài tập của bạn");
        }

        Page<GrammarExercise> page = grammarExerciseRepository.searchExercisesByLecturer(
                keyword, jlptLevel, currentUser.getAccountId(), pageable);

        return PageResponse.from(page.map(grammarExerciseMapper::toResponse));
    }

    // 3. XEM CHI TIẾT 1 BÀI TẬP THEO ID
    @Override
    @Transactional(readOnly = true)
    public GrammarExerciseResponse getExerciseById(Long exerciseId) {
        GrammarExercise exercise = grammarExerciseRepository.findByExerciseId(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("GrammarExercise", "id", exerciseId));

        return grammarExerciseMapper.toResponse(exercise);
    }

    // 4. GIẢNG VIÊN / QUẢN TRỊ VIÊN TẠO BÀI TẬP MỚI
    @Override
    @Transactional
    public GrammarExerciseResponse createExercise(GrammarExerciseCreateRequest request, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Yêu cầu đăng nhập để tạo bài tập");
        }

        boolean canCreate = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_Lecturer") || a.equalsIgnoreCase("Lecturer")
                            || a.equalsIgnoreCase("ROLE_Manager") || a.equalsIgnoreCase("Manager"));

        if (!canCreate) {
            throw new AppException(ErrorCode.FORBIDDEN, "Chỉ tài khoản Giảng viên (Lecturer) hoặc Quản trị viên (Manager) mới có quyền tạo bài tập!");
        }

        // Kiểm tra câu hỏi bài tập không được trùng lặp
        String cleanQuestion = request.getQuestionText() != null ? request.getQuestionText().trim() : "";
        if (grammarExerciseRepository.existsByQuestionTextIgnoreCase(cleanQuestion)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Câu hỏi bài tập '" + cleanQuestion + "' đã tồn tại! Vui lòng tạo câu hỏi khác.");
        }

        // Lấy thông tin tài khoản Giảng viên tạo bài
        Account lecturer = accountRepository.findByEmailAndDeletedAtIsNull(currentUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", currentUser.getEmail()));

        // Chuyển Request DTO sang Entity và lưu DB
        GrammarExercise exercise = grammarExerciseMapper.toEntity(request, lecturer);
        exercise.setQuestionText(cleanQuestion);
        GrammarExercise saved = grammarExerciseRepository.save(exercise);

        log.info("User {} (ID: {}) created grammar exercise ID: {}",
                lecturer.getEmail(), lecturer.getAccountId(), saved.getExerciseId());

        return grammarExerciseMapper.toResponse(saved);
    }

    // 5. GIẢNG VIÊN / QUẢN TRỊ VIÊN CẬP NHẬT BÀI TẬP
    @Override
    @Transactional
    public GrammarExerciseResponse updateExercise(Long exerciseId, GrammarExerciseUpdateRequest request, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để cập nhật bài tập");
        }

        // Tìm bài tập cần sửa
        GrammarExercise exercise = grammarExerciseRepository.findByExerciseId(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("GrammarExercise", "id", exerciseId));

        // Kiểm tra quyền: Chỉ Giảng viên sở hữu HOẶC Quản trị viên mới được sửa
        boolean isOwner = exercise.getCreatedBy() != null && exercise.getCreatedBy().getAccountId().equals(currentUser.getAccountId());
        boolean isManager = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_Manager") || a.equalsIgnoreCase("Manager"));

        if (!isOwner && !isManager) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền chỉnh sửa bài tập do giảng viên khác tạo");
        }

        // Kiểm tra câu hỏi bài tập không được trùng lặp với bài khác
        String cleanQuestion = request.getQuestionText() != null ? request.getQuestionText().trim() : "";
        if (grammarExerciseRepository.existsByQuestionTextIgnoreCaseAndExerciseIdNot(cleanQuestion, exerciseId)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Câu hỏi bài tập '" + cleanQuestion + "' đã được sử dụng bởi bài tập khác! Vui lòng chọn câu hỏi khác.");
        }

        // Cập nhật thông tin và lưu
        grammarExerciseMapper.updateEntityFromDto(request, exercise);
        exercise.setQuestionText(cleanQuestion);
        GrammarExercise updated = grammarExerciseRepository.save(exercise);

        log.info("User {} updated grammar exercise ID: {}", currentUser.getEmail(), updated.getExerciseId());

        return grammarExerciseMapper.toResponse(updated);
    }

    // 6. GIẢNG VIÊN / QUẢN TRỊ VIÊN XÓA BÀI TẬP
    @Override
    @Transactional
    public void deleteExercise(Long exerciseId, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để xóa");
        }

        // Tìm bài tập cần xóa
        GrammarExercise exercise = grammarExerciseRepository.findByExerciseId(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("GrammarExercise", "id", exerciseId));

        // Kiểm tra quyền sở hữu
        boolean isOwner = exercise.getCreatedBy() != null && exercise.getCreatedBy().getAccountId().equals(currentUser.getAccountId());
        boolean isManager = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_Manager") || a.equalsIgnoreCase("Manager"));

        if (!isOwner && !isManager) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn chỉ có thể xóa bài tập do chính mình tạo (hoặc cần quyền Manager)");
        }

        grammarExerciseRepository.delete(exercise);
        log.info("User {} deleted grammar exercise ID: {}", currentUser.getEmail(), exerciseId);
    }
}
