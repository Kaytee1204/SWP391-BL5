package com.example.base.service.auth;

import com.example.base.dto.account.AccountResponse;
import com.example.base.dto.auth.AuthResponse;
import com.example.base.dto.auth.ForgotPasswordRequest;
import com.example.base.dto.auth.ForgotPasswordResponse;
import com.example.base.dto.auth.LoginRequest;
import com.example.base.dto.auth.RegisterRequest;
import com.example.base.dto.auth.ResetPasswordRequest;
import com.example.base.dto.auth.UpdateProfileRequest;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    void logout();

    AccountResponse getCurrentProfile(String email);

    AccountResponse updateCurrentProfile(String email, UpdateProfileRequest request);

    void deleteMyAccount(String email);

    ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
