package com.example.base.mapper;

import com.example.base.dto.request.AccountCreateRequest;
import com.example.base.dto.request.AccountUpdateRequest;
import com.example.base.dto.request.RegisterRequest;
import com.example.base.dto.response.AccountResponse;
import com.example.base.entity.Account;
import com.example.base.entity.AccountStatus;
import com.example.base.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper {

    public Account toEntity(RegisterRequest request) {
        if (request == null) {
            return null;
        }

        Role role = request.getRole() != null ? request.getRole() : Role.Student;

        return Account.builder()
                .email(request.getEmail().trim().toLowerCase())
                .fullName(request.getFullName().trim())
                .avatarUrl(request.getAvatarUrl())
                .role(role)
                .jlptTargetLevel(request.getJlptTargetLevel())
                .status(AccountStatus.active)
                .build();
    }

    public Account toEntity(AccountCreateRequest request) {
        if (request == null) {
            return null;
        }

        AccountStatus status = request.getStatus() != null ? request.getStatus() : AccountStatus.active;

        return Account.builder()
                .email(request.getEmail().trim().toLowerCase())
                .fullName(request.getFullName().trim())
                .avatarUrl(request.getAvatarUrl())
                .role(request.getRole())
                .jlptTargetLevel(request.getJlptTargetLevel())
                .status(status)
                .build();
    }

    public void updateEntityFromDto(AccountUpdateRequest request, Account account) {
        if (request == null || account == null) {
            return;
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            account.setEmail(request.getEmail().trim().toLowerCase());
        }
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            account.setFullName(request.getFullName().trim());
        }
        if (request.getAvatarUrl() != null) {
            account.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (request.getRole() != null) {
            account.setRole(request.getRole());
        }
        if (request.getJlptTargetLevel() != null) {
            account.setJlptTargetLevel(request.getJlptTargetLevel());
        }
        if (request.getStatus() != null) {
            account.setStatus(request.getStatus());
        }
    }

    public AccountResponse toResponse(Account account) {
        if (account == null) {
            return null;
        }

        return AccountResponse.builder()
                .accountId(account.getAccountId())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .avatarUrl(account.getAvatarUrl())
                .role(account.getRole())
                .jlptTargetLevel(account.getJlptTargetLevel())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
