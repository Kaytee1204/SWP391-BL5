package com.example.base.service;

import com.example.base.dto.request.AccountCreateRequest;
import com.example.base.dto.request.AccountUpdateRequest;
import com.example.base.dto.response.AccountResponse;
import com.example.base.dto.response.PageResponse;
import com.example.base.entity.AccountStatus;
import com.example.base.entity.Role;
import org.springframework.data.domain.Pageable;

public interface AccountManagementService {

    PageResponse<AccountResponse> searchAccounts(String keyword, Role role, AccountStatus status, Pageable pageable);

    AccountResponse getAccountById(Long accountId);

    AccountResponse createAccount(AccountCreateRequest request);

    AccountResponse updateAccount(Long accountId, AccountUpdateRequest request);

    AccountResponse updateAccountStatus(Long accountId, AccountStatus status);

    void deleteAccount(Long accountId);
}
