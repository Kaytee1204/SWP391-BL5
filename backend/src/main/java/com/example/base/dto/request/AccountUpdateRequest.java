package com.example.base.dto.request;

import com.example.base.entity.AccountStatus;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountUpdateRequest {

    @Email(message = "Email không đúng định dạng")
    private String email;

    private String password;

    @Size(min = 2, max = 150, message = "Họ và tên từ 2 đến 150 ký tự")
    private String fullName;

    private String avatarUrl;

    private Role role; // Student, Lecturer, Manager, Author

    private JlptLevel jlptTargetLevel;

    private AccountStatus status;
}
