package com.example.base.service.account;

import com.example.base.dto.account.AccountCreateRequest;
import com.example.base.dto.account.AccountResponse;
import com.example.base.dto.account.AccountUpdateRequest;
import com.example.base.dto.common.PageResponse;
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
