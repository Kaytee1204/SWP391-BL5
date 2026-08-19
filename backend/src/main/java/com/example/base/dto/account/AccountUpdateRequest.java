package com.example.base.dto.account;

import com.example.base.entity.AccountStatus;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.Role;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountUpdateRequest {

    @Email(message = "Invalid email format")
    private String email;

    private String password;

    private String fullName;

    private String avatarUrl;

    private Role role;

    private JlptLevel jlptTargetLevel;

    private AccountStatus status;
}
