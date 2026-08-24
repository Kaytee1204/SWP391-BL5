package com.example.base.service.grammar.impl;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.grammar.GrammarPatternCreateRequest;
import com.example.base.dto.grammar.GrammarPatternResponse;
import com.example.base.dto.grammar.GrammarPatternUpdateRequest;
import com.example.base.entity.Account;
import com.example.base.entity.GrammarPattern;
import com.example.base.entity.JlptLevel;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.GrammarPatternMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.GrammarPatternRepository;
import com.example.base.security.UserPrincipal;
import com.example.base.service.grammar.GrammarPatternService;
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
public class GrammarPatternServiceImpl implements GrammarPatternService {

    private final GrammarPatternRepository grammarPatternRepository;
    private final AccountRepository accountRepository;
    private final GrammarPatternMapper grammarPatternMapper;

    // 1. TÌM KIẾM & XEM TẤT CẢ MẪU NGỮ PHÁP (Dành cho tất cả mọi người & Học viên)
    @Override
    @Transactional(readOnly = true)
    public PageResponse<GrammarPatternResponse> searchPatterns(String keyword, JlptLevel jlptLevel, Pageable pageable) {
        log.info("Searching grammar patterns: keyword='{}', jlptLevel={}", keyword, jlptLevel);

        Page<GrammarPattern> page = grammarPatternRepository.searchPatterns(keyword, jlptLevel, pageable);

        return PageResponse.from(page.map(grammarPatternMapper::toResponse));
    }

    // 2. GIẢNG VIÊN / QUẢN TRỊ VIÊN XEM DANH SÁCH MẪU NGỮ PHÁP DO CHÍNH MÌNH TẠO
    @Override
    @Transactional(readOnly = true)
    public PageResponse<GrammarPatternResponse> searchMyPatterns(String keyword, JlptLevel jlptLevel, UserPrincipal currentUser, Pageable pageable) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để xem mẫu ngữ pháp của bạn");
        }

        Page<GrammarPattern> page = grammarPatternRepository.searchPatternsByLecturer(
                keyword, jlptLevel, currentUser.getAccountId(), pageable);

        return PageResponse.from(page.map(grammarPatternMapper::toResponse));
    }

    // 3. XEM CHI TIẾT 1 MẪU NGỮ PHÁP THEO ID
    @Override
    @Transactional(readOnly = true)
    public GrammarPatternResponse getPatternById(Long patternId) {
        GrammarPattern pattern = grammarPatternRepository.findByPatternId(patternId)
                .orElseThrow(() -> new ResourceNotFoundException("GrammarPattern", "id", patternId));

        return grammarPatternMapper.toResponse(pattern);
    }

    // 4. GIẢNG VIÊN & QUẢN TRỊ VIÊN TẠO MẪU NGỮ PHÁP MỚI (Create Grammar Pattern)
    @Override
    @Transactional
    public GrammarPatternResponse createPattern(GrammarPatternCreateRequest request, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Yêu cầu đăng nhập tài khoản Giảng viên hoặc Quản lý để tạo ngữ pháp");
        }

        boolean isAuthorized = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_Lecturer") || a.equalsIgnoreCase("Lecturer")
                            || a.equalsIgnoreCase("ROLE_Manager") || a.equalsIgnoreCase("Manager"));

        if (!isAuthorized) {
            throw new AppException(ErrorCode.FORBIDDEN, "Chỉ tài khoản Giảng viên (Lecturer) hoặc Quản trị viên (Manager) mới có quyền tạo mẫu ngữ pháp!");
        }

        // Kiểm tra tiêu đề mẫu ngữ pháp không được trùng lặp
        String cleanTitle = request.getTitle() != null ? request.getTitle().trim() : "";
        if (grammarPatternRepository.existsByTitleIgnoreCase(cleanTitle)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mẫu ngữ pháp '" + cleanTitle + "' đã tồn tại! Vui lòng đặt tên khác.");
        }

        // Tìm thông tin tài khoản người tạo trong database
        Account creator = accountRepository.findByEmailAndDeletedAtIsNull(currentUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", currentUser.getEmail()));

        // Chuyển DTO thành Entity và gán creator là người tạo (created_by)
        GrammarPattern pattern = grammarPatternMapper.toEntity(request, creator);
        pattern.setTitle(cleanTitle);
        GrammarPattern saved = grammarPatternRepository.save(pattern);

        log.info("User {} (Role: {}, ID: {}) created grammar pattern '{}' (ID: {})",
                creator.getEmail(), creator.getRole(), creator.getAccountId(), saved.getTitle(), saved.getPatternId());

        return grammarPatternMapper.toResponse(saved);
    }

    // 5. GIẢNG VIÊN HOẶC QUẢN TRỊ VIÊN CẬP NHẬT MẪU NGỮ PHÁP (Update Grammar Pattern)
    @Override
    @Transactional
    public GrammarPatternResponse updatePattern(Long patternId, GrammarPatternUpdateRequest request, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện thay đổi");
        }

        // Tìm mẫu ngữ pháp cần sửa
        GrammarPattern pattern = grammarPatternRepository.findByPatternId(patternId)
                .orElseThrow(() -> new ResourceNotFoundException("GrammarPattern", "id", patternId));

        // Kiểm tra quyền: Chỉ Giảng viên tạo ra bài này HOẶC Quản trị viên (Manager) mới có quyền sửa
        boolean isOwner = pattern.getCreatedBy() != null && pattern.getCreatedBy().getAccountId().equals(currentUser.getAccountId());
        boolean isManager = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_Manager") || a.equalsIgnoreCase("Manager"));

        if (!isOwner && !isManager) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền chỉnh sửa mẫu ngữ pháp do giảng viên khác tạo (cần quyền Manager)");
        }

        // Kiểm tra tiêu đề mẫu ngữ pháp không được trùng lặp với mẫu khác
        String cleanTitle = request.getTitle() != null ? request.getTitle().trim() : "";
        if (grammarPatternRepository.existsByTitleIgnoreCaseAndPatternIdNot(cleanTitle, patternId)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mẫu ngữ pháp '" + cleanTitle + "' đã được sử dụng bởi bài khác! Vui lòng đặt tên khác.");
        }

        // Cập nhật các trường dữ liệu
        grammarPatternMapper.updateEntityFromDto(request, pattern);
        pattern.setTitle(cleanTitle);
        GrammarPattern updated = grammarPatternRepository.save(pattern);

        log.info("User {} updated grammar pattern ID: {}", currentUser.getEmail(), updated.getPatternId());

        return grammarPatternMapper.toResponse(updated);
    }

    // 6. GIẢNG VIÊN HOẶC QUẢN TRỊ VIÊN XÓA MẪU NGỮ PHÁP (Delete Grammar Pattern)
    @Override
    @Transactional
    public void deletePattern(Long patternId, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để xóa");
        }

        // Tìm mẫu ngữ pháp cần xóa
        GrammarPattern pattern = grammarPatternRepository.findByPatternId(patternId)
                .orElseThrow(() -> new ResourceNotFoundException("GrammarPattern", "id", patternId));

        // Kiểm tra quyền sở hữu
        boolean isOwner = pattern.getCreatedBy() != null && pattern.getCreatedBy().getAccountId().equals(currentUser.getAccountId());
        boolean isManager = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_Manager") || a.equalsIgnoreCase("Manager"));

        if (!isOwner && !isManager) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn chỉ có thể xóa mẫu ngữ pháp do chính mình tạo (hoặc cần quyền Manager)");
        }

        grammarPatternRepository.delete(pattern);
        log.info("User {} deleted grammar pattern ID: {}", currentUser.getEmail(), patternId);
    }
}
