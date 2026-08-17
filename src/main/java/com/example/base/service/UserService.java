package com.example.base.service;

import com.example.base.dto.request.UserCreateRequest;
import com.example.base.dto.request.UserUpdateRequest;
import com.example.base.dto.response.PageResponse;
import com.example.base.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

public interface UserService {

    UserResponse createUser(UserCreateRequest request);

    UserResponse getUserById(Long id);

    UserResponse getUserByUsername(String username);

    PageResponse<UserResponse> getAllUsers(String keyword, Pageable pageable);

    UserResponse updateUser(Long id, UserUpdateRequest request);

    void deleteUser(Long id);
}
