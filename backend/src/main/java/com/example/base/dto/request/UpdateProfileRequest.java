package com.example.base.dto.request;

import com.example.base.entity.JlptLevel;
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
public class UpdateProfileRequest {

    @Email(message = "Email không đúng định dạng")
    private String email;

    @Size(min = 2, max = 150, message = "Họ và tên từ 2 đến 150 ký tự")
    private String fullName;

    @Size(min = 6, max = 100, message = "Mật khẩu mới phải từ 6 ký tự trở lên")
    private String newPassword;

    private String avatarUrl;

    private JlptLevel jlptTargetLevel;
}
