package com.example.base.service;

import com.example.base.dto.request.LoginRequest;
import com.example.base.dto.request.RegisterRequest;
import com.example.base.dto.request.UpdateProfileRequest;
import com.example.base.dto.response.AccountResponse;
import com.example.base.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    void logout();

    AccountResponse getCurrentProfile(String email);

    AccountResponse updateCurrentProfile(String email, UpdateProfileRequest request);

    void deleteMyAccount(String email);
}
