package com.example.base.dto.auth;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Định dạng email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 50, message = "Mật khẩu phải từ 6 đến 50 ký tự")
    private String password;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 200, message = "Họ và tên không được vượt quá 200 ký tự")
    @Pattern(regexp = "^[\\p{L}\\s.'-]+$", message = "Họ và tên chỉ được chứa chữ cái và khoảng trắng hợp lệ")
    private String fullName;

    private String avatarUrl;

    private Role role;

    private JlptLevel jlptTargetLevel;
}
