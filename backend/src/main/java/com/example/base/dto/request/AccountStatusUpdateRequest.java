package com.example.base.dto.request;

import com.example.base.entity.AccountStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountStatusUpdateRequest {

    @NotNull(message = "Trạng thái tài khoản không được để trống (active, inactive, deleted)")
    private AccountStatus status;
}
