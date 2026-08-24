package com.example.base.controller.payment;

import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.payment.CreatePaymentLinkRequest;
import com.example.base.dto.payment.PaymentLinkResponse;
import com.example.base.dto.payment.PaymentResponse;
import com.example.base.dto.payment.SePayWebhookPayload;
import com.example.base.security.UserPrincipal;
import com.example.base.service.payment.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * PaymentController: Quản lý toàn bộ API Thanh toán Khóa học qua cổng SePay VietQR (VietinBank).
 * Cung cấp các endpoint:
 * 1. POST /payments/create-payment-link : Khởi tạo giao dịch thanh toán & sinh mã QR SePay.
 * 2. POST /payments/sepay-webhook       : Nhận thông báo biến động số dư tự động từ SePay.
 * 3. GET  /payments/check-status/{code} : Kiểm tra trạng thái đơn hàng (dùng cho Auto-Polling phía Frontend).
 * 4. GET  /payments                     : Xem danh sách giao dịch & doanh thu (dành cho Manager & Lecturer).
 * 5. GET  /payments/my-history          : Xem lịch sử thanh toán của cá nhân học viên.
 */
@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "APIs for SePay VietQR Payment, Webhook, and Transaction History")
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * BƯỚC 1: HỌC VIÊN BẤM MUA KHÓA HỌC
     * Nhận `courseId` từ Frontend, tạo bản ghi Payment trạng thái "pending",
     * sinh mã đơn hàng (orderCode) và trả về link ảnh VietQR SePay chứa nội dung `SEVQR <orderCode>`.
     */
    @PostMapping("/create-payment-link")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create SePay VietQR payment for a course")
    public ResponseEntity<ApiResponse<PaymentLinkResponse>> createPaymentLink(
            @Valid @RequestBody CreatePaymentLinkRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        PaymentLinkResponse response = paymentService.createPaymentLink(request, currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo mã VietQR thanh toán SePay thành công!", response));
    }

    /**
     * BƯỚC 2: SEPAY BẮN WEBHOOK KHI NGÂN HÀNG NHẬN ĐƯỢC TIỀN
     * Endpoint công khai (Public) tiếp nhận Webhook từ SePay khi có biến động số dư VietinBank.
     * Tự động trích xuất mã đơn hàng, đối soát số tiền, đổi trạng thái sang "paid" và ghi danh học viên.
     */
    @PostMapping("/sepay-webhook")
    @Operation(summary = "SePay Webhook handler for instant bank transfer notifications")
    public ResponseEntity<ApiResponse<String>> handleSePayWebhook(@RequestBody SePayWebhookPayload payload) {
        log.info("Received SePay Webhook notification: id={}, content='{}'",
                payload != null ? payload.getId() : null,
                payload != null ? payload.getTransactionContent() : null);
        paymentService.processSePayWebhook(payload);
        return ResponseEntity.ok(ApiResponse.success("SePay Webhook processed successfully", "OK"));
    }

    /**
     * BƯỚC 3: AUTO-POLLING TỪ FRONTEND
     * Modal trên Frontend định kỳ gọi endpoint này mỗi 3 giây để kiểm tra xem đơn hàng đã được Webhook kích hoạt thành công hay chưa.
     */
    @GetMapping("/check-status/{orderCode}")
    @Operation(summary = "Check payment transaction status by orderCode")
    public ResponseEntity<ApiResponse<PaymentResponse>> checkPaymentStatus(@PathVariable Long orderCode) {
        PaymentResponse response = paymentService.checkPaymentStatus(orderCode);
        return ResponseEntity.ok(ApiResponse.success("Lấy trạng thái đơn hàng thành công!", response));
    }

    /**
     * Xác thực đơn hàng khi quay lại từ trang thanh toán (Verify Payment Return)
     */
    @GetMapping("/verify-return")
    @Operation(summary = "Verify payment return")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPaymentReturn(
            @RequestParam Long orderCode) {
        PaymentResponse response = paymentService.checkPaymentStatus(orderCode);
        return ResponseEntity.ok(ApiResponse.success("Xác thực thanh toán thành công!", response));
    }

    /**
     * Báo cáo Doanh thu & Lịch sử giao dịch toàn hệ thống (Manager & Lecturer)
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    @Operation(summary = "Get all payment transactions with search, status filter, and pagination (Manager & Lecturer only)")
    public ResponseEntity<ApiResponse<com.example.base.dto.common.PageResponse<PaymentResponse>>> getAllPayments(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = (sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1]))
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        Page<PaymentResponse> result = paymentService.getAllPayments(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(com.example.base.dto.common.PageResponse.from(result)));
    }

    /**
     * API Báo cáo thanh toán tổng hợp cho Manager Dashboard (Thống kê & Tìm kiếm xử lý 100% ở Backend)
     */
    @GetMapping("/report")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    @Operation(summary = "Get overall payment statistics and search results (Manager & Lecturer only)")
    public ResponseEntity<ApiResponse<com.example.base.dto.payment.PaymentReportResponse>> getPaymentReport(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        com.example.base.dto.payment.PaymentReportResponse result = paymentService.getPaymentReport(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Đồng bộ giao dịch SePay thủ công (Manager & Lecturer)
     */
    @PostMapping("/sync")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    @Operation(summary = "Sync pending payments with SePay API (Manager & Lecturer only)")
    public ResponseEntity<ApiResponse<Integer>> syncPaymentsWithSePay() {
        int syncedCount = paymentService.syncPendingPaymentsWithSePay();
        return ResponseEntity.ok(ApiResponse.success("Đã đồng bộ thành công " + syncedCount + " giao dịch từ SePay!", syncedCount));
    }

    /**
     * Xem sao kê tài khoản ngân hàng SePay trực tiếp (Manager & Lecturer)
     */
    @GetMapping("/sepay-transactions")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    @Operation(summary = "Get raw bank transactions from SePay API (Manager & Lecturer only)")
    public ResponseEntity<ApiResponse<java.util.List<java.util.Map<String, Object>>>> getSePayTransactions() {
        java.util.List<java.util.Map<String, Object>> list = paymentService.getSePayBankTransactions();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * Lịch sử thanh toán của riêng học viên đang đăng nhập
     */
    @GetMapping("/my-history")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's payment history")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMyPaymentHistory(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<PaymentResponse> list = paymentService.getMyPaymentHistory(currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
