package com.example.base.service.payment.impl;

import com.example.base.dto.payment.CreatePaymentLinkRequest;
import com.example.base.dto.payment.PaymentLinkResponse;
import com.example.base.dto.payment.PaymentResponse;
import com.example.base.dto.payment.SePayWebhookPayload;
import com.example.base.entity.Account;
import com.example.base.entity.Course;
import com.example.base.entity.Enrollment;
import com.example.base.entity.Payment;
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
import java.util.stream.Collectors;

/**
 * PaymentServiceImpl: Triển khai toàn bộ nghiệp vụ thanh toán SePay VietQR (VietinBank).
 * Bao gồm các chức năng cốt lõi:
 * 1. Khởi tạo đơn hàng thanh toán (Create Payment Link) & sinh mã QR SePay.
 * 2. Xử lý Webhook tự động từ SePay khi VietinBank báo có tiền (Smart Scanner).
 * 3. Ghi danh tự động (Enrollment) cho học viên khi thanh toán thành công.
 * 4. Kiểm tra trạng thái đơn hàng (Polling & Tra cứu trực tiếp API SePay).
 * 5. Báo cáo doanh thu & Lịch sử thanh toán.
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
    // 1. HỌC VIÊN BẤM "MUA KHÓA HỌC" -> TẠO ĐƠN HÀNG & SINH MÃ QR SEPAY
    // ========================================================================
    @Override
    @Transactional
    public PaymentLinkResponse createPaymentLink(CreatePaymentLinkRequest request, String studentEmail) {
        // Bước 1.1: Tìm học viên và khóa học tương ứng
        Account student = accountRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", studentEmail));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", request.getCourseId()));

        // Bước 1.2: Kiểm tra học viên đã đăng ký/sở hữu khóa học này chưa
        if (enrollmentRepository.existsByStudent_AccountIdAndCourse_CourseId(student.getAccountId(), course.getCourseId())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Bạn đã đăng ký và sở hữu khóa học này rồi!");
        }

        Long amount = course.getPrice() != null ? course.getPrice() : 0L;

        // Bước 1.3: Nếu khóa học miễn phí (0 VNĐ), tự động ghi danh ngay lập tức mà không cần chuyển khoản
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

        // Bước 1.4: Sinh mã đơn hàng (orderCode) 6 chữ số duy nhất dựa theo timestamp
        long randomSuffix = (long) (Math.random() * 9000L) + 1000L;
        long orderCode = (System.currentTimeMillis() / 1000L) % 100000L * 1000L + (randomSuffix % 1000L);
        if (orderCode < 100000L) {
            orderCode += 100000L;
        }

        // Bắt buộc tiền tố "SEVQR" theo quy định tích hợp của VietinBank & SePay
        String transferContent = "SEVQR " + orderCode;

        // Bước 1.5: Lưu bản ghi Payment trạng thái ban đầu là "pending" (Chờ thanh toán)
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

        // Bước 1.6: Sinh link ảnh mã QR VietQR từ máy chủ SePay
        String qrCodeUrl = sePayService.generateQrCodeUrl(amount, transferContent);

        // Trả DTO thông tin thanh toán về cho Frontend hiển thị Modal
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
    // 2. SEPAY BẮN WEBHOOK VỀ -> XỬ LÝ ĐỐI SOÁT & KÍCH HOẠT KHÓA HỌC TỰ ĐỘNG
    // ========================================================================
    @Override
    @Transactional
    public void processSePayWebhook(SePayWebhookPayload payload) {
        log.info("Received SePay Webhook: content='{}', amountIn={}, gateway={}, ref={}",
                payload.getTransactionContent(), payload.getAmountIn(), payload.getGateway(), payload.getReferenceNumber());

        // Kiểm tra nếu là giao dịch tiền vào hợp lệ (> 0)
        if (payload.getAmountIn() == null || payload.getAmountIn() <= 0) {
            log.info("Ignoring outgoing/zero amount transaction");
            return;
        }

        // Bước 2.1: Lấy chuỗi nội dung chuyển khoản gửi về từ SePay
        String contentToParse = payload.getTransactionContent();
        if (contentToParse == null || contentToParse.isBlank()) {
            contentToParse = payload.getCode();
        }
        if (contentToParse == null || contentToParse.isBlank()) {
            contentToParse = payload.getDescription();
        }

        // Bước 2.2: Dùng Smart Scanner trích xuất mã đơn hàng sau từ khóa SEVQR
        Long orderCode = sePayService.extractOrderCodeFromContent(contentToParse);
        Payment payment = null;
        if (orderCode != null) {
            payment = paymentRepository.findByOrderCode(orderCode).orElse(null);
        }

        // Fallback: Quét tất cả các cụm số trong nội dung nếu có số tham chiếu ngân hàng đi kèm
        if (payment == null && contentToParse != null) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d{4,12})").matcher(contentToParse);
            while (m.find()) {
                try {
                    Long candidateCode = Long.parseLong(m.group(1));
                    java.util.Optional<Payment> opt = paymentRepository.findByOrderCode(candidateCode);
                    if (opt.isPresent()) {
                        payment = opt.get();
                        orderCode = candidateCode;
                        log.info("Found matching payment with candidate orderCode={} in content '{}'", candidateCode, contentToParse);
                        break;
                    }
                } catch (Exception ignored) {}
            }
        }

        // Nếu không tìm thấy đơn hàng trong Database
        if (payment == null) {
            log.warn("Payment record not found for SePay content: '{}'", contentToParse);
            return;
        }

        // Nếu đơn hàng đã được kích hoạt trước đó rồi thì bỏ qua
        if ("paid".equalsIgnoreCase(payment.getStatus())) {
            log.info("Payment orderCode={} was already marked as paid", orderCode);
            return;
        }

        // Bước 2.3: Kiểm tra số tiền chuyển vào đủ hoặc lớn hơn giá khóa học
        if (payload.getAmountIn() >= (payment.getAmount() != null ? payment.getAmount() : 0)) {
            payment.setStatus("paid");
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.info("Payment orderCode={} marked as PAID via SePay Webhook", orderCode);

            // Bước 2.4: Tự động ghi danh (Enrollment) cho học viên vào học ngay
            createEnrollmentIfNotExists(payment);
        } else {
            log.warn("Payment orderCode={} received insufficient amount (required={}, received={})",
                    orderCode, payment.getAmount(), payload.getAmountIn());
        }
    }

    // ========================================================================
    // 3. KIỂM TRA TRẠNG THÁI THANH TOÁN (DÙNG CHO AUTO-POLLING PHÍA FRONTEND)
    // ========================================================================
    @Override
    @Transactional
    public PaymentResponse checkPaymentStatus(Long orderCode) {
        Payment payment = paymentRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderCode", orderCode));

        // Nếu đơn hàng đang pending, thử kiểm tra dự phòng trực tiếp qua SePay API
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

    /**
     * Hàm phụ trợ: Tạo bản ghi Enrollment nếu học viên chưa có trong khóa học
     */
    private void createEnrollmentIfNotExists(Payment payment) {
        if (payment.getStudent() != null && payment.getCourse() != null) {
            Long studentId = payment.getStudent().getAccountId();
            Long courseId = payment.getCourse().getCourseId();

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
    // 4. BÁO CÁO DOANH THU & LỊCH SỬ GIAO DỊCH
    // ========================================================================
    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        Page<Payment> page = paymentRepository.findAllByOrderByCreatedAtDesc(pageable);
        return page.map(this::toPaymentResponse);
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
