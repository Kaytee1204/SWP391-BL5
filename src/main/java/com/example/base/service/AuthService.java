package com.example.base.service;

import com.example.base.dto.request.LoginRequest;
import com.example.base.dto.request.RegisterRequest;
import com.example.base.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    AuthResponse refreshToken(String refreshToken);
}
