package com.example.base.dto.account;

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

    @NotNull(message = "Status is required")
    private AccountStatus status;
}
