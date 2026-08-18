package com.example.base.service.account.impl;

import com.example.base.dto.account.AccountCreateRequest;
import com.example.base.dto.account.AccountResponse;
import com.example.base.dto.account.AccountUpdateRequest;
import com.example.base.dto.common.PageResponse;
import com.example.base.entity.Account;
import com.example.base.entity.AccountStatus;
import com.example.base.entity.Role;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.AccountMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.service.account.AccountManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountManagementServiceImpl implements AccountManagementService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccountResponse> searchAccounts(String keyword, Role role, AccountStatus status, Pageable pageable) {
        Page<Account> page = accountRepository.searchAccounts(keyword, role, status, pageable);
        return PageResponse.from(page.map(accountMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));
        return accountMapper.toResponse(account);
    }

    @Override
    @Transactional
    public AccountResponse createAccount(AccountCreateRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (accountRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email '" + email + "' đã tồn tại trong hệ thống");
        }

        Account account = accountMapper.toEntity(request);
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        Account saved = accountRepository.save(account);
        log.info("Manager created account: id={}, email={}, role={}", saved.getAccountId(), saved.getEmail(), saved.getRole());

        return accountMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(Long accountId, AccountUpdateRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (accountRepository.existsByEmailAndAccountIdNot(newEmail, accountId)) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email '" + newEmail + "' đã được sử dụng bởi tài khoản khác");
            }
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        accountMapper.updateEntityFromDto(request, account);
        Account updated = accountRepository.save(account);

        log.info("Manager updated account: id={}, email={}, role={}, status={}",
                updated.getAccountId(), updated.getEmail(), updated.getRole(), updated.getStatus());

        return accountMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public AccountResponse updateAccountStatus(Long accountId, AccountStatus status) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        account.setStatus(status);
        if (status == AccountStatus.deleted) {
            account.setDeletedAt(LocalDateTime.now());
        } else {
            account.setDeletedAt(null);
        }

        Account updated = accountRepository.save(account);
        log.info("Manager changed status of account id={} to {}", accountId, status);

        return accountMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        account.setStatus(AccountStatus.deleted);
        account.setDeletedAt(LocalDateTime.now());
        accountRepository.save(account);

        log.info("Manager soft-deleted account id={}", accountId);
    }
}
