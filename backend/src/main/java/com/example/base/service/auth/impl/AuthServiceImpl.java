package com.example.base.service.auth.impl;

import com.example.base.dto.account.AccountResponse;
import com.example.base.dto.auth.AuthResponse;
import com.example.base.dto.auth.ForgotPasswordRequest;
import com.example.base.dto.auth.ForgotPasswordResponse;
import com.example.base.dto.auth.LoginRequest;
import com.example.base.dto.auth.RegisterRequest;
import com.example.base.dto.auth.ResetPasswordRequest;
import com.example.base.dto.auth.UpdateProfileRequest;
import com.example.base.entity.Account;
import com.example.base.entity.AccountStatus;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.AccountMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.security.JwtTokenProvider;
import com.example.base.service.auth.AuthService;
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

    // =========================================================================
    // LUỒNG QUÊN MẬT KHẨU (FORGOT PASSWORD) BẰNG MÃ OTP 2 BƯỚC
    // =========================================================================

    // Lớp nội bộ để lưu trữ thông tin mã OTP và thời hạn trong bộ nhớ
    private static class OtpEntry {
        final String otpCode;
        final LocalDateTime expiryTime;

        OtpEntry(String otpCode, LocalDateTime expiryTime) {
            this.otpCode = otpCode;
            this.expiryTime = expiryTime;
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryTime);
        }
    }

    // Bộ nhớ đệm (Cache) an toàn lưu trữ OTP theo từng email (Hết hạn sau 5 phút)
    private final java.util.concurrent.ConcurrentHashMap<String, OtpEntry> otpStorage = new java.util.concurrent.ConcurrentHashMap<>();

    /**
     * BƯỚC 1: XỬ LÝ YÊU CẦU QUÊN MẬT KHẨU & SINH MÃ OTP 6 SỐ
     */
    @Override
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // 1. Kiểm tra tài khoản có tồn tại trong cơ sở dữ liệu hay không
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND, "Không tìm thấy tài khoản với email: " + email));

        // 2. Kiểm tra trạng thái tài khoản
        if (account.getStatus() == AccountStatus.deleted || account.getDeletedAt() != null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND, "Tài khoản không tồn tại hoặc đã bị xóa khỏi hệ thống");
        }
        if (account.getStatus() == AccountStatus.inactive) {
            throw new AppException(ErrorCode.ACCOUNT_INACTIVE, "Tài khoản đang bị khóa hoặc ngưng hoạt động");
        }

        // 3. Sinh mã OTP ngẫu nhiên gồm 6 chữ số (từ 100000 đến 999999)
        String otpCode = String.format("%06d", new java.util.Random().nextInt(900000) + 100000);
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5); // Có hiệu lực 5 phút

        // 4. Lưu mã OTP vào bộ nhớ đệm
        otpStorage.put(email, new OtpEntry(otpCode, expiryTime));

        log.info("=================================================================");
        log.info("MÃ OTP ĐẶT LẠI MẬT KHẨU CHO EMAIL {}: {}", email, otpCode);
        log.info("hời hạn mã OTP: 5 phút (hết hạn lúc {})", expiryTime);
        log.info("=================================================================");

        return ForgotPasswordResponse.builder()
                .email(email)
                .message("Mã xác thực OTP đã được tạo thành công (Hiệu lực trong 5 phút).")
                .demoOtp(otpCode) // Trả về demoOtp để hiển thị thông báo trực tiếp trên UI
                .expiresInSeconds(300L)
                .build();
    }

    /**
     * BƯỚC 2: XÁC THỰC MÃ OTP & ĐẶT LẠI MẬT KHẨU MỚI
     */
    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String inputOtp = request.getOtp().trim();

        // 1. Kiểm tra mã OTP trong bộ nhớ đệm
        OtpEntry entry = otpStorage.get(email);
        if (entry == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Yêu cầu không hợp lệ hoặc bạn chưa yêu cầu mã OTP. Vui lòng bấm 'Gửi mã OTP' trước.");
        }

        // 2. Kiểm tra thời hạn mã OTP (5 phút)
        if (entry.isExpired()) {
            otpStorage.remove(email); // Xóa mã đã hết hạn
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã OTP đã hết hạn sau 5 phút. Vui lòng yêu cầu mã OTP mới.");
        }

        // 3. So khớp mã OTP người dùng nhập vào
        if (!entry.otpCode.equals(inputOtp)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã OTP không chính xác. Vui lòng kiểm tra lại!");
        }

        // 4. Tìm tài khoản trong cơ sở dữ liệu
        Account account = accountRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", email));

        // 5. Mã hóa mật khẩu mới bằng thuật toán bảo mật BCrypt
        account.setPasswordHash(passwordEncoder.encode(request.getNewPassword().trim()));
        accountRepository.save(account);

        // 6. Xóa mã OTP sau khi sử dụng thành công (Chống tấn công dùng lại OTP)
        otpStorage.remove(email);

        log.info("Mật khẩu cho tài khoản {} đã được đặt lại thành công", email);
    }
}
