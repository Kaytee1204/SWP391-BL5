package com.example.base.dto.payment;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long paymentId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentAvatarUrl;

    private Long courseId;
    private String courseTitle;
    private String courseJlptLevel;

    private Long amount;
    private Long orderCode;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
