package com.example.base.controller.account;

import com.example.base.dto.account.AccountCreateRequest;
import com.example.base.dto.account.AccountResponse;
import com.example.base.dto.account.AccountStatusUpdateRequest;
import com.example.base.dto.account.AccountUpdateRequest;
import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.common.PageResponse;
import com.example.base.entity.AccountStatus;
import com.example.base.entity.Role;
import com.example.base.service.account.AccountManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@Tag(name = "Account Management", description = "APIs for Managers and Users to manage accounts")
public class AccountManagementController {

    private final AccountManagementService accountManagementService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "View Account List with filters by role, status, and keyword")
    public ResponseEntity<ApiResponse<PageResponse<AccountResponse>>> getAccountList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AccountResponse> pageResponse = accountManagementService.searchAccounts(keyword, role, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager') or authentication.principal.id == #id or authentication.principal.username == #id")
    @Operation(summary = "View Account Details by ID")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountById(@PathVariable Long id) {
        AccountResponse response = accountManagementService.getAccountById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Create Account manually (Student, Lecturer, Manager, Author)")
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(@Valid @RequestBody AccountCreateRequest request) {
        AccountResponse response = accountManagementService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo tài khoản thành công", response));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.POST})
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager') or authentication.principal.id == #id or authentication.principal.username == #id")
    @Operation(summary = "Update Account details, Avatar, and Role")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AccountUpdateRequest request) {
        AccountResponse response = accountManagementService.updateAccount(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tài khoản thành công", response));
    }

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.POST})
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Active / Deactivate Account status")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccountStatus(
            @PathVariable Long id,
            @Valid @RequestBody AccountStatusUpdateRequest request) {
        AccountResponse response = accountManagementService.updateAccountStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái tài khoản thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Remove / Soft delete an account from the system")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@PathVariable Long id) {
        accountManagementService.deleteAccount(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tài khoản thành công", null));
    }
}
