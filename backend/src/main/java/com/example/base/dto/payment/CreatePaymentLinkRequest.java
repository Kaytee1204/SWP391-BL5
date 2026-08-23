package com.example.base.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePaymentLinkRequest {

    @NotNull(message = "ID khóa học không được để trống")
    private Long courseId;
}
