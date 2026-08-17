package com.example.base.service.impl;

import com.example.base.dto.request.LoginRequest;
import com.example.base.dto.request.RegisterRequest;
import com.example.base.dto.request.UserCreateRequest;
import com.example.base.dto.response.AuthResponse;
import com.example.base.dto.response.UserResponse;
import com.example.base.entity.Role;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.security.JwtTokenProvider;
import com.example.base.service.AuthService;
import com.example.base.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(request.getUsername());
        UserResponse userResponse = userService.getUserByUsername(request.getUsername());

        log.info("User {} logged in successfully", request.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        UserCreateRequest createRequest = UserCreateRequest.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .roles(Set.of(Role.ROLE_USER))
                .build();

        UserResponse userResponse = userService.createUser(createRequest);

        String accessToken = tokenProvider.generateAccessToken(userResponse.getUsername());
        String refreshToken = tokenProvider.generateRefreshToken(userResponse.getUsername());

        log.info("User {} registered successfully", request.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED, "Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String username = tokenProvider.getUsernameFromJwt(refreshToken);
        UserResponse userResponse = userService.getUserByUsername(username);

        String newAccessToken = tokenProvider.generateAccessToken(username);
        String newRefreshToken = tokenProvider.generateRefreshToken(username);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }
}
