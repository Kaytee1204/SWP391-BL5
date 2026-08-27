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
 * =========================================================================================
 * PaymentController: Quản lý toàn bộ API Thanh toán Khóa học qua cổng SePay VietQR (VietinBank).
 * =========================================================================================
 * Các luồng nghiệp vụ chính:
 * 1. POST /payments/create-payment-link : Khởi tạo đơn hàng & sinh mã QR SePay chuyển khoản.
 * 2. POST /payments/sepay-webhook       : Nhận thông báo biến động số dư tự động (Webhook) từ SePay.
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
     * =====================================================================================
     * BƯỚC 1: HỌC VIÊN BẤM MUA KHÓA HỌC (TẠO ĐƠN HÀNG & SINH MÃ VIETQR)
     * =====================================================================================
     * - Nhận `courseId` từ Frontend.
     * - Kiểm tra học viên đã mua khóa học này chưa (tránh mua trùng).
     * - Tạo bản ghi Payment trong Database ở trạng thái "pending" với mã `orderCode` duy nhất.
     * - Trả về thông tin chuyển khoản kèm link ảnh VietQR SePay chứa nội dung `SEVQR <orderCode>`.
     */
    @PostMapping("/create-payment-link")
    @PreAuthorize("hasAnyAuthority('Student', 'ROLE_Student', 'ROLE_STUDENT', 'student')")
    @Operation(summary = "Create SePay VietQR payment for a course (Student only)")
    public ResponseEntity<ApiResponse<PaymentLinkResponse>> createPaymentLink(
            @Valid @RequestBody CreatePaymentLinkRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        PaymentLinkResponse response = paymentService.createPaymentLink(request, currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo mã VietQR thanh toán SePay thành công!", response));
    }

    /**
     * =====================================================================================
     * BƯỚC 2: SEPAY BẮN WEBHOOK VỀ KHI NGÂN HÀNG NHẬN ĐƯỢC TIỀN (XÁC THỰC TỰ ĐỘNG)
     * =====================================================================================
     * - Endpoint công khai (Public) tiếp nhận Webhook từ SePay khi có biến động số dư VietinBank.
     * - Xử lý bóc tách `orderCode` từ nội dung chuyển khoản (`transactionContent`).
     * - Đối soát số tiền `amountIn >= payment.amount`.
     * - Đổi trạng thái sang "paid", ghi nhận `paidAt`, và tự động ghi danh (Enrollment) cho học viên.
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
     * =====================================================================================
     * BƯỚC 3: AUTO-POLLING TỪ FRONTEND (KIỂM TRA TRẠNG THÁI GIAO DỊCH REAL-TIME)
     * =====================================================================================
     * - Modal phía Frontend định kỳ gọi endpoint này mỗi 3 giây để kiểm tra xem đơn hàng
     *   đã được Webhook kích hoạt thành công hay chưa.
     * - Nếu trong DB vẫn là "pending", Backend sẽ chủ động gọi API SePay dự phòng (Fallback)
     *   để kiểm tra sao kê ngân hàng và kích hoạt đơn nếu tiền đã vào.
     */
    @GetMapping("/check-status/{orderCode}")
    @Operation(summary = "Check payment transaction status by orderCode")
    public ResponseEntity<ApiResponse<PaymentResponse>> checkPaymentStatus(@PathVariable Long orderCode) {
        PaymentResponse response = paymentService.checkPaymentStatus(orderCode);
        return ResponseEntity.ok(ApiResponse.success("Lấy trạng thái đơn hàng thành công!", response));
    }

    /**
     * =====================================================================================
     * XÁC THỰC KHI QUAY LẠI TỪ LINK THANH TOÁN (Verify Payment Return)
     * =====================================================================================
     */
    @GetMapping("/verify-return")
    @Operation(summary = "Verify payment return")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPaymentReturn(
            @RequestParam Long orderCode) {
        PaymentResponse response = paymentService.checkPaymentStatus(orderCode);
        return ResponseEntity.ok(ApiResponse.success("Xác thực thanh toán thành công!", response));
    }

    /**
     * =====================================================================================
     * BÁO CÁO DOANH THU & LỊCH SỬ GIAO DỊCH TOÀN HỆ THỐNG (DÀNH CHO MANAGER & LECTURER)
     * =====================================================================================
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
     * =====================================================================================
     * API BÁO CÁO THANH TOÁN TỔNG HỢP CHO MANAGER DASHBOARD
     * =====================================================================================
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
     * =====================================================================================
     * ĐỒNG BỘ THỦ CÔNG CÁC ĐƠN PENDING VỚI SEPAY API (Sync Payments)
     * =====================================================================================
     */
    @PostMapping("/sync")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    @Operation(summary = "Sync pending payments with SePay API (Manager & Lecturer only)")
    public ResponseEntity<ApiResponse<Integer>> syncPaymentsWithSePay() {
        int syncedCount = paymentService.syncPendingPaymentsWithSePay();
        return ResponseEntity.ok(ApiResponse.success("Đã đồng bộ thành công " + syncedCount + " giao dịch từ SePay!", syncedCount));
    }

    /**
     * =====================================================================================
     * XEM SAO KÊ TRỰC TIẾP TỪ TÀI KHOẢN NGÂN HÀNG SEPAY
     * =====================================================================================
     */
    @GetMapping("/sepay-transactions")
    @PreAuthorize("hasAnyAuthority('Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager', 'Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer')")
    @Operation(summary = "Get raw bank transactions from SePay API (Manager & Lecturer only)")
    public ResponseEntity<ApiResponse<java.util.List<java.util.Map<String, Object>>>> getSePayTransactions() {
        java.util.List<java.util.Map<String, Object>> list = paymentService.getSePayBankTransactions();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * =====================================================================================
     * LỊCH SỬ THANH TOÁN CỦA RIÊNG HỌC VIÊN ĐANG ĐĂNG NHẬP
     * =====================================================================================
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
