package com.example.base.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response DTO after requesting forgot password OTP")
public class ForgotPasswordResponse {

    @Schema(description = "Account email that received OTP", example = "student@gmail.com")
    private String email;

    @Schema(description = "Notification message", example = "OTP verification code has been generated")
    private String message;

    @Schema(description = "Demo OTP code returned in development mode for easy testing", example = "849201")
    private String demoOtp;

    @Schema(description = "Expiry time in seconds", example = "300")
    private Long expiresInSeconds;
}
