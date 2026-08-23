package com.example.base.service.reading_passage.impl;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.reading_passage.request.ReadingPassageCreateRequest;
import com.example.base.dto.reading_passage.request.ReadingPassageUpdateRequest;
import com.example.base.dto.reading_passage.response.ReadingPassageResponse;
import com.example.base.entity.Account;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.ReadingPassage;
import com.example.base.exception.AppException;
import com.example.base.exception.BadRequestException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.ReadingPassageMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.ReadingPassageRepository;
import com.example.base.security.UserPrincipal;
import com.example.base.service.reading_passage.ReadingPassageHtmlSanitizer;
import com.example.base.service.reading_passage.ReadingPassageService;
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
public class ReadingPassageServiceImpl implements ReadingPassageService {
    private final ReadingPassageRepository readingPassageRepository;
    private final AccountRepository accountRepository;
    private final ReadingPassageMapper readingPassageMapper;
    private final ReadingPassageHtmlSanitizer htmlSanitizer;


    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReadingPassageResponse> searchPassages(String keyword, JlptLevel jlptLevel, Pageable pageable) {
            Page<ReadingPassage> page =
                    readingPassageRepository.searchPassages(
                            normalizeKeyword(keyword),
                            jlptLevel,
                            pageable
                    );

            return PageResponse.from(
                    page.map(readingPassageMapper::toResponse)
            );
        }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReadingPassageResponse> searchMyPassages(String keyword, JlptLevel jlptLevel, UserPrincipal currentUser, Pageable pageable) {
        requireAuthenticated(currentUser);

        Page<ReadingPassage> page =
                readingPassageRepository.searchMyPassages(
                        currentUser.getAccountId(),
                        normalizeKeyword(keyword),
                        jlptLevel,
                        pageable
                );

        return PageResponse.from(
                page.map(readingPassageMapper::toResponse)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ReadingPassageResponse getPassageById(Long passageId) {
        ReadingPassage passage = findPassage(passageId);
        return readingPassageMapper.toResponse(passage);
    }

    @Override
    @Transactional
    public ReadingPassageResponse createPassage(
            ReadingPassageCreateRequest request,
            UserPrincipal currentUser
    ) {
        requireAuthenticated(currentUser);

        if (!hasAuthority(currentUser, "Lecturer")) {
            throw new AppException(
                    ErrorCode.FORBIDDEN,
                    "Chỉ Lecturer mới được tạo bài đọc"
            );
        }

        Account lecturer = accountRepository
                .findByAccountIdAndDeletedAtIsNull(
                        currentUser.getAccountId()
                )
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account",
                        "id",
                        currentUser.getAccountId()
                ));

        String sanitizedContent =
                htmlSanitizer.sanitize(request.getContentHtml());

        ReadingPassage passage = readingPassageMapper.toEntity(
                request,
                lecturer,
                sanitizedContent
        );

        ReadingPassage saved =
                readingPassageRepository.save(passage);

        log.info(
                "Lecturer {} created reading passage ID {}",
                currentUser.getEmail(),
                saved.getPassageId()
        );

        return readingPassageMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ReadingPassageResponse updatePassage(
            Long passageId,
            ReadingPassageUpdateRequest request,
            UserPrincipal currentUser
    ) {
        requireAuthenticated(currentUser);

        ReadingPassage passage = findPassage(passageId);
        checkOwnershipOrManager(passage, currentUser);
        validateUpdateRequest(request);

        String sanitizedContent = null;

        if (request.getContentHtml() != null) {
            sanitizedContent =
                    htmlSanitizer.sanitize(request.getContentHtml());
        }

        readingPassageMapper.updateEntity(
                request,
                passage,
                sanitizedContent
        );

        ReadingPassage updated =
                readingPassageRepository.save(passage);

        log.info(
                "User {} updated reading passage ID {}",
                currentUser.getEmail(),
                passageId
        );

        return readingPassageMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deletePassage(
            Long passageId,
            UserPrincipal currentUser
    ) {
        requireAuthenticated(currentUser);

        ReadingPassage passage = findPassage(passageId);
        checkOwnershipOrManager(passage, currentUser);

        readingPassageRepository.delete(passage);

        log.info(
                "User {} deleted reading passage ID {}",
                currentUser.getEmail(),
                passageId
        );
    }

    private ReadingPassage findPassage(Long passageId) {
        return readingPassageRepository.findById(passageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ReadingPassage",
                        "id",
                        passageId
                ));
    }

    private void requireAuthenticated(UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new AppException(
                    ErrorCode.UNAUTHORIZED,
                    "Vui lòng đăng nhập để thực hiện chức năng này"
            );
        }
    }

    private void checkOwnershipOrManager(
            ReadingPassage passage,
            UserPrincipal currentUser
    ) {
        boolean isOwner =
                passage.getCreatedBy() != null
                        && passage.getCreatedBy()
                        .getAccountId()
                        .equals(currentUser.getAccountId());

        boolean isManager =
                hasAuthority(currentUser, "Manager");

        if (!isOwner && !isManager) {
            throw new AppException(
                    ErrorCode.FORBIDDEN,
                    "Bạn không có quyền thay đổi bài đọc này"
            );
        }
    }

    private boolean hasAuthority(
            UserPrincipal currentUser,
            String role
    ) {
        return currentUser.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority ->
                        authority.equalsIgnoreCase(role)
                                || authority.equalsIgnoreCase(
                                "ROLE_" + role
                        )
                );
    }

    private void validateUpdateRequest(
            ReadingPassageUpdateRequest request
    ) {
        if (request.getTitle() != null
                && request.getTitle().isBlank()) {
            throw new BadRequestException(
                    "Tiêu đề không được để trống"
            );
        }

        boolean hasUpdate =
                request.getJlptLevel() != null
                        || request.getTitle() != null
                        || request.getContentHtml() != null
                        || request.getTranslation() != null
                        || request.getIsPreview() != null;

        if (!hasUpdate) {
            throw new BadRequestException(
                    "Không có dữ liệu nào để cập nhật"
            );
        }
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }

        return keyword.trim();
    }
}
