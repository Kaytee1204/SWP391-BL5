package com.example.base.service.payment.impl;

import com.example.base.dto.payment.CreatePaymentLinkRequest;
import com.example.base.dto.payment.PaymentLinkResponse;
import com.example.base.dto.payment.PaymentReportResponse;
import com.example.base.dto.payment.PaymentResponse;
import com.example.base.dto.payment.SePayWebhookPayload;
import com.example.base.entity.*;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.CourseRepository;
import com.example.base.repository.EnrollmentRepository;
import com.example.base.repository.PaymentRepository;
import com.example.base.service.payment.PaymentService;
import com.example.base.service.sepay.SePayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * =========================================================================================
 * PaymentServiceImpl: Triển khai toàn bộ nghiệp vụ thanh toán SePay VietQR (VietinBank).
 * =========================================================================================
 * Toàn bộ quy trình xác thực thanh toán:
 * 1. Khởi tạo đơn hàng & sinh link VietQR SePay động chứa nội dung "SEVQR <orderCode>".
 * 2. Tiếp nhận Webhook từ SePay khi có biến động số dư ngân hàng:
 *    - Bóc tách mã đơn `orderCode` từ nội dung chuyển khoản qua Regex.
 *    - Đối soát số tiền thực nhận `amountIn >= payment.amount`.
 *    - Cập nhật trạng thái `status = "paid"` và tự động tạo `Enrollment` mở khóa học.
 * 3. Hỗ trợ Fallback Polling: Kiểm tra qua API SePay nếu mạng bị trễ Webhook.
 * 4. Báo cáo doanh thu & tìm kiếm lịch sử giao dịch.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final AccountRepository accountRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SePayService sePayService;

    // ========================================================================
    // BƯỚC 1: HỌC VIÊN BẤM "MUA KHÓA HỌC" -> TẠO ĐƠN HÀNG & SINH MÃ QR SEPAY
    // ========================================================================
    @Override
    @Transactional
    public PaymentLinkResponse createPaymentLink(CreatePaymentLinkRequest request, String studentEmail) {
        // 1.1. Tìm thông tin học viên & khóa học từ Database
        Account student = accountRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", studentEmail));

        if (student.getRole() != Role.Student) {
            throw new AppException(ErrorCode.FORBIDDEN, "Chỉ tài khoản Học viên (Student) mới có thể thực hiện thanh toán mua khóa học!");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", request.getCourseId()));

        // 1.2. Kiểm tra chặn mua trùng: Nếu học viên đã sở hữu khóa học thì báo lỗi ngay
        if (enrollmentRepository.existsByStudent_AccountIdAndCourse_CourseId(student.getAccountId(), course.getCourseId())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Bạn đã đăng ký và sở hữu khóa học này rồi!");
        }

        Long amount = course.getPrice() != null ? course.getPrice() : 0L;

        // 1.3. Trường hợp khóa học miễn phí (Giá = 0đ): Kích hoạt ghi danh ngay lập tức

        if (amount <= 0) {
            Enrollment enrollment = Enrollment.builder()
                    .student(student)
                    .course(course)
                    .progressPercent(BigDecimal.ZERO)
                    .build();
            enrollmentRepository.save(enrollment);

            return PaymentLinkResponse.builder()
                    .courseId(course.getCourseId())
                    .courseTitle(course.getTitle())
                    .amount(0L)
                    .status("paid")
                    .build();
        }

        // 1.4. Sinh mã đơn hàng (orderCode) ngẫu nhiên 6 chữ số duy nhất dựa theo timestamp + random suffix
        long randomSuffix = (long) (Math.random() * 9000L) + 1000L;
        long orderCode = (System.currentTimeMillis() / 1000L) % 100000L * 1000L + (randomSuffix % 1000L);
        if (orderCode < 100000L) {
            orderCode += 100000L;
        }

        // 1.5. Cú pháp nội dung chuyển khoản bắt buộc theo chuẩn SePay VietinBank: "SEVQR <orderCode>"
        String transferContent = "SEVQR " + orderCode;

        // 1.6. Tao ban ghi
        Payment payment = Payment.builder()
                .student(student)
                .course(course)
                .amount(amount)
                .orderCode(orderCode)
                .status("pending")
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Created SePay pending payment id={}, orderCode={}, student={}, course={}, amount={}",
                savedPayment.getPaymentId(), orderCode, studentEmail, course.getTitle(), amount);

        // 1.7. Tạo link ảnh mã VietQR SePay động (đã nhúng số tài khoản, số tiền và nội dung chuyển khoản)
        String qrCodeUrl = sePayService.generateQrCodeUrl(amount, transferContent);

        // 1.8. Trả về thông tin cho Frontend hiển thị Modal thanh toán QR
        return PaymentLinkResponse.builder()
                .paymentId(savedPayment.getPaymentId())
                .orderCode(orderCode)
                .amount(amount)
                .status("pending")
                .qrCode(qrCodeUrl)
                .checkoutUrl(qrCodeUrl)
                .courseId(course.getCourseId())
                .courseTitle(course.getTitle())
                .bankCode(sePayService.getBankCode())
                .accountNumber(sePayService.getAccountNumber())
                .accountName(sePayService.getAccountName())
                .transferContent(transferContent)
                .build();
    }

    // ========================================================================
    // BƯỚC 2: SEPAY BẮN WEBHOOK VỀ -> XỬ LÝ ĐỐI SOÁT & KÍCH HOẠT KHÓA HỌC TỰ ĐỘNG
    // ========================================================================
    @Override
    @Transactional
    public void processSePayWebhook(SePayWebhookPayload payload) {
        //json ->
        log.info("Received SePay Webhook: content='{}', amountIn={}, gateway={}, ref={}",
                payload.getTransactionContent(), payload.getAmountIn(), payload.getGateway(), payload.getReferenceNumber());

        // 2.1. Bỏ qua nếu giao dịch không có tiền hoặc là giao dịch tiền ra
        if (payload.getAmountIn() == null || payload.getAmountIn() <= 0) {
            log.info("Ignoring outgoing/zero amount transaction");
            return;
        }

        // 2.2. Thu thập nội dung chuyển khoản từ payload của SePay
        String contentToParse = payload.getTransactionContent();
        if (contentToParse == null || contentToParse.isBlank()) {
            contentToParse = payload.getCode();
        }
        if (contentToParse == null || contentToParse.isBlank()) {
            contentToParse = payload.getDescription();
        }

        // 2.3. Bóc tách mã đơn hàng `orderCode` từ nội dung chuyển khoản bằng Regex
        Long orderCode = sePayService.extractOrderCodeFromContent(contentToParse);
        Payment payment = null;
        if (orderCode != null) {
            payment = paymentRepository.findByOrderCode(orderCode).orElse(null);
        }

        // 2.4. Phương án tìm kiếm phụ: Quét tất cả cụm số 4-12 chữ số trong nội dung nếu regex chính chưa bắt được
        if (payment == null && contentToParse != null) {
            Matcher m = Pattern.compile("(\\d{4,12})").matcher(contentToParse);
            while (m.find()) {
                try {
                    Long candidateCode = Long.parseLong(m.group(1));
                    Optional<Payment> opt = paymentRepository.findByOrderCode(candidateCode);
                    if (opt.isPresent()) {
                        payment = opt.get();
                        orderCode = candidateCode;
                        log.info("Found matching payment with candidate orderCode={} in content '{}'", candidateCode, contentToParse);
                        break;
                    }
                } catch (Exception ignored) {}
            }
        }

        // 2.5. Nếu không tìm thấy đơn hàng tương ứng trong hệ thống -> Bỏ qua
        if (payment == null) {
            log.warn("Payment record not found for SePay content: '{}'", contentToParse);
            return;
        }

        // 2.6. Chống xử lý trùng lặp (Idempotency): Nếu đơn hàng đã "paid" thì không xử lý lại
        if ("paid".equalsIgnoreCase(payment.getStatus())) {
            log.info("Payment orderCode={} was already marked as paid", orderCode);
            return;
        }

        // 2.7. ĐỐI SOÁT SỐ TIỀN: Tiền thực nhận vào tài khoản phải >= Giá tiền đơn hàng
        if (payload.getAmountIn() >= (payment.getAmount() != null ? payment.getAmount() : 0)) {
            payment.setStatus("paid");
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.info("Payment orderCode={} marked as PAID via SePay Webhook", orderCode);

            // Tự động kích hoạt ghi danh (Enrollment) mở khóa học cho học viên
            createEnrollmentIfNotExists(payment);
        } else {
            log.warn("Payment orderCode={} received insufficient amount (required={}, received={})",
                    orderCode, payment.getAmount(), payload.getAmountIn());
        }
    }

    // ========================================================================
    // BƯỚC 3: KIỂM TRA TRẠNG THÁI THANH TOÁN
    // ========================================================================
    @Override
    @Transactional
    public PaymentResponse checkPaymentStatus(Long orderCode) {
        // 3.1. Tìm đơn hàng theo orderCode
        Payment payment = paymentRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderCode", orderCode));

        // 3.2. Nếu đơn hàng vẫn ở trạng thái "pending", chủ động gọi SePay API kiểm tra sao kê gần nhất (Cơ chế Fallback)
        if ("pending".equalsIgnoreCase(payment.getStatus())) {
            boolean isPaidViaApi = sePayService.checkRecentTransactionsViaApi(orderCode, payment.getAmount());
            if (isPaidViaApi) {
                payment.setStatus("paid");
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);
                createEnrollmentIfNotExists(payment);
                log.info("Payment orderCode={} marked as PAID via direct SePay API check", orderCode);
            }
        }

        return toPaymentResponse(payment);
    }

    // ========================================================================
    // ĐỒNG BỘ GIAO DỊCH TỪ SEPAY API THỦ CÔNG
    // ========================================================================
    @Override
    @Transactional
    public int syncPendingPaymentsWithSePay() {
        List<Map<String, Object>> transactions = sePayService.fetchRecentTransactionsFromApi(50);
        if (transactions == null || transactions.isEmpty()) {
            return 0;
        }

        int syncedCount = 0;
        for (Map<String, Object> tx : transactions) {
            String txContent = (String) tx.get("transaction_content");
            if (txContent == null) txContent = (String) tx.get("content");
            if (txContent == null) txContent = (String) tx.get("description");

            Long orderCode = sePayService.extractOrderCodeFromContent(txContent);
            Payment payment = null;
            if (orderCode != null) {
                payment = paymentRepository.findByOrderCode(orderCode).orElse(null);
            }

            if (payment == null && txContent != null) {
                Matcher m = Pattern.compile("(\\d{4,12})").matcher(txContent);
                while (m.find()) {
                    try {
                        Long candidate = Long.parseLong(m.group(1));
                        Optional<Payment> opt = paymentRepository.findByOrderCode(candidate);
                        if (opt.isPresent()) {
                            payment = opt.get();
                            orderCode = candidate;
                            break;
                        }
                    } catch (Exception ignored) {}
                }
            }

            if (payment != null && "pending".equalsIgnoreCase(payment.getStatus())) {
                Object amountInObj = tx.get("amount_in");
                double amountIn = amountInObj != null ? Double.parseDouble(amountInObj.toString()) : 0;
                if (amountIn >= (payment.getAmount() != null ? payment.getAmount() : 0)) {
                    payment.setStatus("paid");
                    payment.setPaidAt(LocalDateTime.now());
                    paymentRepository.save(payment);
                    createEnrollmentIfNotExists(payment);
                    syncedCount++;
                }
            }
        }
        return syncedCount;
    }

    @Override
    public List<Map<String, Object>> getSePayBankTransactions() {
        List<Map<String, Object>> list = sePayService.fetchRecentTransactionsFromApi(50);
        for (Map<String, Object> tx : list) {
            String txContent = (String) tx.get("transaction_content");
            if (txContent == null) txContent = (String) tx.get("content");
            if (txContent == null) txContent = (String) tx.get("description");

            Long orderCode = sePayService.extractOrderCodeFromContent(txContent);
            if (orderCode == null && txContent != null) {
                Matcher m = Pattern.compile("(\\d{4,12})").matcher(txContent);
                if (m.find()) {
                    try {
                        orderCode = Long.parseLong(m.group(1));
                    } catch (Exception ignored) {}
                }
            }

            if (orderCode != null) {
                Optional<Payment> opt = paymentRepository.findByOrderCode(orderCode);
                if (opt.isPresent()) {
                    Payment p = opt.get();
                    tx.put("matchedOrderCode", p.getOrderCode());
                    tx.put("matchedStudentName", p.getStudent() != null ? p.getStudent().getFullName() : null);
                    tx.put("matchedCourseTitle", p.getCourse() != null ? p.getCourse().getTitle() : null);
                    tx.put("matchedStatus", p.getStatus());
                }
            }
        }
        return list;
    }

    /**
     * =====================================================================================
     * HÀM TỰ ĐỘNG GHI DANH KHÓA HỌC (TẠO ENROLLMENT) CHO HỌC VIÊN
     * =====================================================================================
     */
    private void createEnrollmentIfNotExists(Payment payment) {
        if (payment.getStudent() != null && payment.getCourse() != null) {
            Long studentId = payment.getStudent().getAccountId();
            Long courseId = payment.getCourse().getCourseId();

            // Kiểm tra xem đã ghi danh chưa (tránh tạo 2 bản ghi trùng)
            if (!enrollmentRepository.existsByStudent_AccountIdAndCourse_CourseId(studentId, courseId)) {
                Enrollment enrollment = Enrollment.builder()
                        .student(payment.getStudent())
                        .course(payment.getCourse())
                        .payment(payment)
                        .progressPercent(BigDecimal.ZERO)
                        .build();

                enrollmentRepository.save(enrollment);
                log.info("Enrollment created successfully for studentId={} in courseId={} with paymentId={}",
                        studentId, courseId, payment.getPaymentId());
            }
        }
    }

    // ========================================================================
    // BÁO CÁO DOANH THU & TÌM KIẾM TỪ DATABASE (TÍNH TOÁN 100% Ở BACKEND)
    // ========================================================================
    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllPayments(String keyword, String status, Pageable pageable) {
        Page<Payment> page;
        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = keyword.trim();
            if (kw.matches("\\d+")) {
                try {
                    Long orderCode = Long.parseLong(kw);
                    page = paymentRepository.findByOrderCode(orderCode, pageable);
                    if (page.isEmpty()) {
                        page = paymentRepository.searchByKeyword(kw, pageable);
                    }
                } catch (Exception e) {
                    page = paymentRepository.searchByKeyword(kw, pageable);
                }
            } else {
                page = paymentRepository.searchByKeyword(kw, pageable);
            }
        } else if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
            page = paymentRepository.findByStatus(status.trim().toLowerCase(), pageable);
        } else {
            page = paymentRepository.findAll(pageable);
        }
        return page.map(this::toPaymentResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentReportResponse getPaymentReport(String keyword, Pageable pageable) {
        Page<PaymentResponse> pageData = getAllPayments(keyword, null, pageable);

        Long totalRevenue = paymentRepository.sumTotalPaidRevenue();
        long totalTransactions = paymentRepository.count();
        long paidCount = paymentRepository.countByStatus("paid");
        long pendingCount = paymentRepository.countByStatus("pending");

        return PaymentReportResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : 0L)
                .totalTransactions(totalTransactions)
                .paidCount(paidCount)
                .pendingCount(pendingCount)
                .pageData(com.example.base.dto.common.PageResponse.from(pageData))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPaymentHistory(String studentEmail) {
        Account student = accountRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", studentEmail));

        List<Payment> list = paymentRepository.findByStudent_AccountIdOrderByCreatedAtDesc(student.getAccountId());
        return list.stream().map(this::toPaymentResponse).collect(Collectors.toList());
    }

    private PaymentResponse toPaymentResponse(Payment p) {
        return PaymentResponse.builder()
                .paymentId(p.getPaymentId())
                .studentId(p.getStudent() != null ? p.getStudent().getAccountId() : null)
                .studentName(p.getStudent() != null ? p.getStudent().getFullName() : null)
                .studentEmail(p.getStudent() != null ? p.getStudent().getEmail() : null)
                .studentAvatarUrl(p.getStudent() != null ? p.getStudent().getAvatarUrl() : null)
                .courseId(p.getCourse() != null ? p.getCourse().getCourseId() : null)
                .courseTitle(p.getCourse() != null ? p.getCourse().getTitle() : null)
                .courseJlptLevel(p.getCourse() != null && p.getCourse().getJlptLevel() != null ? p.getCourse().getJlptLevel().name() : null)
                .amount(p.getAmount())
                .orderCode(p.getOrderCode())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .paidAt(p.getPaidAt())
                .build();
    }
}
