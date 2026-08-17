package com.example.base.dto.request;

import com.example.base.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @Email(message = "Email không đúng định dạng")
    private String email;

    @Size(max = 100, message = "Họ và tên tối đa 100 ký tự")
    private String fullName;

    @Pattern(regexp = "^(0[0-9]{9})?$", message = "Số điện thoại không hợp lệ (10 chữ số bắt đầu bằng 0)")
    private String phoneNumber;

    private String avatarUrl;

    private Boolean enabled;

    private Set<Role> roles;
}
