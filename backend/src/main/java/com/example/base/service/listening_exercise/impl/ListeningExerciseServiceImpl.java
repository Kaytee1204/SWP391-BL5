package com.example.base.service.listening_exercise.impl;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.listening_exercise.request.ListeningExerciseCreateRequest;
import com.example.base.dto.listening_exercise.request.ListeningExerciseUpdateRequest;
import com.example.base.dto.listening_exercise.response.ListeningExerciseResponse;
import com.example.base.entity.*;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.ListeningExerciseMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.ListeningExerciseRepository;
import com.example.base.security.UserPrincipal;
import com.example.base.service.listening_exercise.ListeningAudioStorageService;
import com.example.base.service.listening_exercise.ListeningAudioStorageService.StoredAudio;
import com.example.base.service.listening_exercise.ListeningExerciseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListeningExerciseServiceImpl implements ListeningExerciseService {

    private final ListeningExerciseRepository repository;
    private final AccountRepository accountRepository;
    private final ListeningExerciseMapper mapper;
    private final ListeningAudioStorageService audioStorage;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ListeningExerciseResponse> search(
            String keyword,
            JlptLevel jlptLevel,
            Pageable pageable
    ) {
        return PageResponse.from(repository.search(normalizeKeyword(keyword), jlptLevel, pageable)
                .map(mapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ListeningExerciseResponse> searchMine(
            String keyword,
            JlptLevel jlptLevel,
            UserPrincipal currentUser,
            Pageable pageable
    ) {
        requireAuthenticated(currentUser);
        return PageResponse.from(repository.searchMine(
                        currentUser.getAccountId(), normalizeKeyword(keyword), jlptLevel, pageable)
                .map(mapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ListeningExerciseResponse getById(Long id) {
        return mapper.toResponse(findExercise(id));
    }

    @Override
    @Transactional
    public ListeningExerciseResponse create(
            ListeningExerciseCreateRequest request,
            MultipartFile audio,
            UserPrincipal currentUser
    ) {
        requireLecturer(currentUser);
        Account lecturer = accountRepository.findByAccountIdAndDeletedAtIsNull(currentUser.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", currentUser.getAccountId()));

        StoredAudio storedAudio = audioStorage.store(audio);
        try {
            ListeningExercise saved = repository.saveAndFlush(mapper.toEntity(request, lecturer, storedAudio));
            return mapper.toResponse(saved);
        } catch (RuntimeException exception) {
            audioStorage.deleteQuietly(storedAudio.storageName());
            throw exception;
        }
    }

    @Override
    @Transactional
    public ListeningExerciseResponse update(
            Long id,
            ListeningExerciseUpdateRequest request,
            MultipartFile replacementAudio,
            UserPrincipal currentUser
    ) {
        requireAuthenticated(currentUser);
        ListeningExercise entity = findExercise(id);
        checkOwnershipOrManager(entity, currentUser);

        StoredAudio storedAudio = replacementAudio == null || replacementAudio.isEmpty()
                ? null
                : audioStorage.store(replacementAudio);
        String oldStorageName = entity.getAudioStorageName();

        try {
            mapper.updateEntity(request, entity, storedAudio);
            ListeningExercise updated = repository.saveAndFlush(entity);
            if (storedAudio != null) audioStorage.deleteQuietly(oldStorageName);
            return mapper.toResponse(updated);
        } catch (RuntimeException exception) {
            if (storedAudio != null) audioStorage.deleteQuietly(storedAudio.storageName());
            throw exception;
        }
    }

    @Override
    @Transactional
    public void delete(Long id, UserPrincipal currentUser) {
        requireAuthenticated(currentUser);
        ListeningExercise entity = findExercise(id);
        checkOwnershipOrManager(entity, currentUser);
        String storageName = entity.getAudioStorageName();

        repository.delete(entity);
        repository.flush();
        audioStorage.deleteQuietly(storageName);
        log.info("User {} deleted listening exercise {}", currentUser.getEmail(), id);
    }

    private ListeningExercise findExercise(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ListeningExercise", "id", id));
    }

    private void checkOwnershipOrManager(ListeningExercise entity, UserPrincipal currentUser) {
        boolean owner = entity.getCreatedBy() != null
                && entity.getCreatedBy().getAccountId().equals(currentUser.getAccountId());
        if (!owner && !hasAuthority(currentUser, "Manager")) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thay đổi bài nghe này");
        }
    }

    private void requireLecturer(UserPrincipal currentUser) {
        requireAuthenticated(currentUser);
        if (!hasAuthority(currentUser, "Lecturer")) {
            throw new AppException(ErrorCode.FORBIDDEN, "Chỉ Lecturer được tạo bài nghe");
        }
    }

    private void requireAuthenticated(UserPrincipal currentUser) {
        if (currentUser == null) throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    private boolean hasAuthority(UserPrincipal currentUser, String role) {
        return currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> authority.equalsIgnoreCase(role)
                        || authority.equalsIgnoreCase("ROLE_" + role));
    }

    private String normalizeKeyword(String keyword) {
        return keyword == null || keyword.isBlank() ? null : keyword.trim();
    }
}
