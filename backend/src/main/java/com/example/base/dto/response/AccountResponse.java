package com.example.base.dto.response;

import com.example.base.entity.AccountStatus;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {

    private Long accountId;
    private String email;
    private String fullName;
    private String avatarUrl;
    private Role role;
    private JlptLevel jlptTargetLevel;
    private AccountStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
