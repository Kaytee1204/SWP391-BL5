package com.example.base.dto.payment;

import com.example.base.dto.common.PageResponse;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentReportResponse {
    private Long totalRevenue;
    private Long totalTransactions;
    private Long paidCount;
    private Long pendingCount;
    private PageResponse<PaymentResponse> pageData;
}
