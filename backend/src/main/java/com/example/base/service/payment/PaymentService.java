package com.example.base.service.payment;

import com.example.base.dto.payment.CreatePaymentLinkRequest;
import com.example.base.dto.payment.PaymentLinkResponse;
import com.example.base.dto.payment.PaymentReportResponse;
import com.example.base.dto.payment.PaymentResponse;
import com.example.base.dto.payment.SePayWebhookPayload;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface PaymentService {

    PaymentLinkResponse createPaymentLink(CreatePaymentLinkRequest request, String studentEmail);

    void processSePayWebhook(SePayWebhookPayload payload);

    PaymentResponse checkPaymentStatus(Long orderCode);

    Page<PaymentResponse> getAllPayments(String keyword, String status, Pageable pageable);

    PaymentReportResponse getPaymentReport(String keyword, Pageable pageable);

    List<PaymentResponse> getMyPaymentHistory(String studentEmail);

    int syncPendingPaymentsWithSePay();

    List<Map<String, Object>> getSePayBankTransactions();
}
