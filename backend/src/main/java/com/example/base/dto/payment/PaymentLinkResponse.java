package com.example.base.dto.payment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentLinkResponse {

    private Long paymentId;
    private Long orderCode;
    private Long amount;
    private String status;
    private String checkoutUrl;
    private String qrCode;
    private String paymentLinkId;
    private Long courseId;
    private String courseTitle;

    // Thông tin ngân hàng SePay
    private String bankCode;
    private String accountNumber;
    private String accountName;
    private String transferContent;
}
