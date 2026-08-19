package com.example.base.controller.auth;

import com.example.base.dto.account.AccountResponse;
import com.example.base.dto.auth.AuthResponse;
import com.example.base.dto.auth.LoginRequest;
import com.example.base.dto.auth.RegisterRequest;
import com.example.base.dto.auth.UpdateProfileRequest;
import com.example.base.dto.common.ApiResponse;
import com.example.base.security.JwtTokenProvider;
import com.example.base.security.UserPrincipal;
import com.example.base.service.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for Account login, register, logout, and profile")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    // 1. ĐĂNG NHẬP (Trả về chuỗi JWT Token)
    @PostMapping("/login")
    @Operation(summary = "Account Login (Returns JWT Access Token)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", authResponse));
    }

    // 2. ĐĂNG KÝ TỰ DO DÀNH CHO HỌC VIÊN (Student)
    @PostMapping("/register")
    @Operation(summary = "Student Registration (Self register)")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký tài khoản thành công", authResponse));
    }

    // 3. ĐĂNG XUẤT (Xóa session bảo mật)
    @RequestMapping(value = "/logout", method = {RequestMethod.POST, RequestMethod.GET})
    @Operation(summary = "Account Logout (Invalidate session/context)")
    public ResponseEntity<ApiResponse<Void>> logout() {
        authService.logout();
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    // 4. LẤY THÔNG TIN PROFILE CỦA CHÍNH MÌNH (Dựa vào Token gửi kèm)
    @GetMapping("/me")
    @Operation(summary = "Get current authenticated account profile")
    public ResponseEntity<ApiResponse<AccountResponse>> getCurrentProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        AccountResponse response = authService.getCurrentProfile(currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 5. CẬP NHẬT PROFILE CÁ NHÂN (Cho tất cả các role: Student, Lecturer, Author, Manager)
    @RequestMapping(value = "/me", method = {RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.POST})
    @Operation(summary = "Update current authenticated account profile (Email, Name, Password, Avatar, JLPT Level)")
    public ResponseEntity<ApiResponse<AuthResponse>> updateCurrentProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        // Cập nhật thông tin trong Database
        AccountResponse response = authService.updateCurrentProfile(currentUser.getEmail(), request);

        // Sinh token mới (phòng trường hợp user đổi email)
        String newAccessToken = tokenProvider.generateAccessToken(response.getEmail());
        String newRefreshToken = tokenProvider.generateRefreshToken(response.getEmail());

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .account(response)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin cá nhân thành công", authResponse));
    }

    // 6. TỰ XÓA / ĐÓNG TÀI KHOẢN CỦA CHÍNH MÌNH
    @DeleteMapping("/me")
    @Operation(summary = "Self-delete / Close current account")
    public ResponseEntity<ApiResponse<Void>> deleteMyAccount(@AuthenticationPrincipal UserPrincipal currentUser) {
        authService.deleteMyAccount(currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Tài khoản của bạn đã được xóa thành công", null));
    }

    // 7. YÊU CẦU MÃ OTP QUÊN MẬT KHẨU (Bước 1 - Public API)
    @PostMapping("/forgot-password")
    @Operation(summary = "Step 1: Request 6-digit OTP code for password reset")
    public ResponseEntity<ApiResponse<com.example.base.dto.auth.ForgotPasswordResponse>> forgotPassword(
            @Valid @RequestBody com.example.base.dto.auth.ForgotPasswordRequest request) {
        com.example.base.dto.auth.ForgotPasswordResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Mã OTP xác thực đã được tạo thành công", response));
    }

    // 8. XÁC THỰC MÃ OTP VÀ ĐẶT LẠI MẬT KHẨU MỚI (Bước 2 - Public API)
    @PostMapping("/reset-password")
    @Operation(summary = "Step 2: Verify 6-digit OTP code and set new password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody com.example.base.dto.auth.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu mới thành công! Bạn có thể đăng nhập ngay.", null));
    }
}
