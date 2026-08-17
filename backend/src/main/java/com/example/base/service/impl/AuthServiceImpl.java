package com.example.base.service.impl;

import com.example.base.dto.request.LoginRequest;
import com.example.base.dto.request.RegisterRequest;
import com.example.base.dto.request.UpdateProfileRequest;
import com.example.base.dto.response.AccountResponse;
import com.example.base.dto.response.AuthResponse;
import com.example.base.entity.Account;
import com.example.base.entity.AccountStatus;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.AccountMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.security.JwtTokenProvider;
import com.example.base.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS, "Tài khoản hoặc mật khẩu không chính xác"));

        if (account.getStatus() == AccountStatus.deleted || account.getDeletedAt() != null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND, "Tài khoản không tồn tại hoặc đã bị xóa khỏi hệ thống");
        }

        if (account.getStatus() == AccountStatus.inactive) {
            throw new AppException(ErrorCode.ACCOUNT_INACTIVE, "Tài khoản đang bị khóa hoặc ngưng hoạt động. Vui lòng liên hệ Quản lý!");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String accessToken = tokenProvider.generateAccessToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(email);

            log.info("Account {} (Role: {}) logged in successfully", email, account.getRole());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .account(accountMapper.toResponse(account))
                    .build();
        } catch (BadCredentialsException ex) {
            log.warn("Login failed for {}: invalid credentials", email);
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Mật khẩu không chính xác");
        }
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (accountRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email '" + email + "' đã được đăng ký");
        }

        Account account = accountMapper.toEntity(request);
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        Account saved = accountRepository.save(account);
        log.info("Registered new account: {} with role: {}", saved.getEmail(), saved.getRole());

        String accessToken = tokenProvider.generateAccessToken(saved.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(saved.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .account(accountMapper.toResponse(saved))
                .build();
    }

    @Override
    public void logout() {
        SecurityContextHolder.clearContext();
        log.info("User logged out and security context cleared");
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getCurrentProfile(String email) {
        Account account = accountRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", email));
        return accountMapper.toResponse(account);
    }

    @Override
    @Transactional
    public AccountResponse updateCurrentProfile(String currentEmail, UpdateProfileRequest request) {
        Account account = accountRepository.findByEmailAndDeletedAtIsNull(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", currentEmail));

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(account.getEmail())) {
                if (accountRepository.existsByEmail(newEmail)) {
                    throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email '" + newEmail + "' đã được sử dụng bởi tài khoản khác");
                }
                account.setEmail(newEmail);
            }
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            account.setFullName(request.getFullName().trim());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            account.setPasswordHash(passwordEncoder.encode(request.getNewPassword().trim()));
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            account.setAvatarUrl(request.getAvatarUrl().trim());
        }

        if (request.getJlptTargetLevel() != null) {
            account.setJlptTargetLevel(request.getJlptTargetLevel());
        }

        Account updated = accountRepository.save(account);
        log.info("User {} updated profile to email={}, fullName={}, avatarUrl={}",
                currentEmail, updated.getEmail(), updated.getFullName(), updated.getAvatarUrl());

        return accountMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteMyAccount(String email) {
        Account account = accountRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", email));

        account.setStatus(AccountStatus.deleted);
        account.setDeletedAt(LocalDateTime.now());
        accountRepository.save(account);

        SecurityContextHolder.clearContext();
        log.info("User {} self-deleted account", email);
    }
}
