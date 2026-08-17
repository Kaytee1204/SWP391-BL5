package com.example.base.dto.request;

import com.example.base.entity.AccountStatus;
import com.example.base.entity.JlptLevel;
import com.example.base.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountCreateRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6 ký tự trở lên")
    private String password;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 150, message = "Họ và tên từ 2 đến 150 ký tự")
    private String fullName;

    private String avatarUrl;

    @NotNull(message = "Vai trò (Role) không được để trống")
    private Role role; // Student, Lecturer, Manager, Author

    private JlptLevel jlptTargetLevel; // N5, N4, N3, N2, N1 (áp dụng cho Student)

    @Builder.Default
    private AccountStatus status = AccountStatus.active;
}
