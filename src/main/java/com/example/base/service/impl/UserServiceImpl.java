package com.example.base.service.impl;

import com.example.base.dto.request.UserCreateRequest;
import com.example.base.dto.request.UserUpdateRequest;
import com.example.base.dto.response.PageResponse;
import com.example.base.dto.response.UserResponse;
import com.example.base.entity.User;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.UserMapper;
import com.example.base.repository.UserRepository;
import com.example.base.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByUsernameAndDeletedFalse(request.getUsername())) {
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS, "Username đã được sử dụng");
        }

        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS, "Email đã được sử dụng");
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        log.info("Created user successfully with id: {}", savedUser.getId());

        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsernameAndDeletedFalse(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(String keyword, Pageable pageable) {
        Page<User> usersPage = userRepository.searchUsers(keyword, pageable);
        Page<UserResponse> responsePage = usersPage.map(userMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
                throw new AppException(ErrorCode.USER_ALREADY_EXISTS, "Email đã được sử dụng");
            }
        }

        userMapper.updateEntityFromDto(request, user);
        User updatedUser = userRepository.save(user);
        log.info("Updated user with id: {}", updatedUser.getId());

        return userMapper.toResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setDeleted(true);
        userRepository.save(user);
        log.info("Soft-deleted user with id: {}", id);
    }
}
