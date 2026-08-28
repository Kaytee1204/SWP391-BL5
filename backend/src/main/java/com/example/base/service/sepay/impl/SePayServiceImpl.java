package com.example.base.service.sepay.impl;

import com.example.base.service.sepay.SePayService;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * =========================================================================================
 * SePayServiceImpl: Dịch vụ tích hợp trực tiếp với cổng thanh toán SePay VietQR (VietinBank).
 * =========================================================================================
 * Các chức năng chính:
 * 1. Sinh link ảnh mã VietQR chuẩn động `https://qr.sepay.vn/img?...`
 * 2. Bóc tách mã đơn hàng `orderCode` từ chuỗi tin nhắn ngân hàng bằng Regular Expression.
 * 3. Gọi Open API của SePay (`https://my.sepay.vn/userapi/transactions/list`) để kiểm tra sao kê dự phòng.
 */
@Slf4j
@Getter
@Service
public class SePayServiceImpl implements SePayService {

    @Value("${app.sepay.bank-code:VietinBank}")
    private String bankCode;

    @Value("${app.sepay.account-number:103874683969}")
    private String accountNumber;

    @Value("${app.sepay.account-name:TRINH BAO KHANH}")
    private String accountName;

    @Value("${app.sepay.api-key:LOC0GNYOOSV5M5WKE6JXBFDGVHB29G7836SIXKQXYPCTDRUNLZ3C2BWQZFJMD9R1}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // Regex ưu tiên 1: Bắt chính xác tiền tố SEVQR hoặc JLMS hoặc DH hoặc ORDER kèm theo số đơn hàng
    private static final Pattern PREFIX_PATTERN = Pattern.compile("(?:SEVQR|JLMS|DH|ORDER)\\s*(\\d{4,12})", Pattern.CASE_INSENSITIVE);

    /**
     * =====================================================================================
     * 1. SINH LINK ẢNH MÃ VIETQR TỪ MÁY CHỦ SEPAY
     * =====================================================================================
     * @param amount: Số tiền của khóa học (VND)
     * @param transferContent: Nội dung chuyển khoản (Ví dụ: "SEVQR 894215")
     * @return URL ảnh mã QR chuẩn Napas247 của SePay
     */
    @Override
    public String generateQrCodeUrl(Long amount, String transferContent) {
        try {
            String cleanAcc = (accountNumber != null && !accountNumber.isBlank()) ? accountNumber.trim() : "103874683969";
            String cleanBank = (bankCode != null && !bankCode.isBlank()) ? bankCode.trim() : "VietinBank";

            // URL Encode nội dung chuyển khoản để nhúng an toàn vào URL
            String encodedDes = URLEncoder.encode(transferContent, StandardCharsets.UTF_8);

            // Mẫu mã QR compact chính thức từ SePay
            return String.format("https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%d&des=%s&template=compact",
                    cleanAcc, cleanBank, amount, encodedDes);
        } catch (Exception e) {
            log.error("Error generating SePay QR URL: {}", e.getMessage());
            return String.format("https://qr.sepay.vn/img?acc=%s&bank=VietinBank&amount=%d&des=%s",
                    accountNumber, amount, transferContent);
        }
    }

    /**
     * =====================================================================================
     * 2. BÓC TÁCH MÃ ĐƠN HÀNG (orderCode) TỪ NỘI DUNG CHUYỂN KHOẢN NGÂN HÀNG
     * =====================================================================================
     * Ví dụ nội dung SMS từ ngân hàng: "CT den 103874683969 SEVQR 894215 NGUYEN VAN A chuyen tien"
     * -> Hàm sẽ dùng Regex trích xuất ra đúng số: `894215`
     */
    @Override
    public Long extractOrderCodeFromContent(String content) {
        if (content == null || content.isBlank()) {
            return null;
        }

        // Bước 1: Tìm theo tiền tố chuẩn (SEVQR, JLMS...)
        Matcher matcher = PREFIX_PATTERN.matcher(content.trim());
        if (matcher.find()) {
            try {
                return Long.parseLong(matcher.group(1));
            } catch (NumberFormatException e) {
                log.warn("Could not parse number from prefix regex match: {}", matcher.group(1));
            }
        }

        // Bước 2: Thử tìm chuỗi số liên tiếp 6-10 chữ số nếu người dùng lỡ xóa tiền tố SEVQR
        Pattern numberPattern = Pattern.compile("(\\d{6,10})");
        Matcher numMatcher = numberPattern.matcher(content);
        while (numMatcher.find()) {
            try {
                return Long.parseLong(numMatcher.group(1));
            } catch (NumberFormatException ignored) {}
        }

        return null;
    }

    /**
     * =====================================================================================
     * 3. LẤY DANH SÁCH SAO KÊ GIAO DỊCH GẦN NHẤT TỪ SEPAY OPEN API
     * =====================================================================================
     */
    @Override
    public List<Map<String, Object>> fetchRecentTransactionsFromApi(int limit) {
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("SEPAY_API_KEY")) {
            return Collections.emptyList();
        }

        try {
            String url = "https://my.sepay.vn/userapi/transactions/list?limit=" + Math.max(limit, 20);
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey.trim());
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List<Map<String, Object>> transactions = (List<Map<String, Object>>) body.get("transactions");
                if (transactions != null) {
                    return transactions;
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch recent transactions from SePay API: {}", e.getMessage());
        }

        return Collections.emptyList();
    }

    /**
     * =====================================================================================
     * 4. CƠ CHẾ DỰ PHÒNG (FALLBACK): ĐỐI SOÁT ĐƠN HÀNG QUA SEPAY API
     * =====================================================================================
     * Khi webhook bị trễ, hàm này sẽ quét danh sách giao dịch gần nhất từ API để tìm đơn khớp.
     */
    @Override
    public boolean checkRecentTransactionsViaApi(Long orderCode, Long expectedAmount) {
        List<Map<String, Object>> transactions = fetchRecentTransactionsFromApi(30);
        for (Map<String, Object> tx : transactions) {
            String txContent = (String) tx.get("transaction_content");
            if (txContent == null) txContent = (String) tx.get("content");
            if (txContent == null) txContent = (String) tx.get("description");

            Long extractedCode = extractOrderCodeFromContent(txContent);
            if (extractedCode != null && extractedCode.equals(orderCode)) {
                Object amountInObj = tx.get("amount_in");
                double amountIn = amountInObj != null ? Double.parseDouble(amountInObj.toString()) : 0;
                // Đối soát số tiền nhận được >= số tiền yêu cầu
                if (amountIn >= (expectedAmount != null ? expectedAmount : 0)) {
                    log.info("Matched transaction from SePay API for orderCode={}: amount={}", orderCode, amountIn);
                    return true;
                }
            }
        }
        return false;
    }
}
