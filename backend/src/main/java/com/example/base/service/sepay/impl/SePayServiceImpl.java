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
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    @Value("${app.sepay.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // Ưu tiên 1: Bắt chính xác tiền tố SEVQR hoặc JLMS hoặc DH hoặc ORDER
    private static final Pattern PREFIX_PATTERN = Pattern.compile("(?:SEVQR|JLMS|DH|ORDER)\\s*(\\d{4,12})", Pattern.CASE_INSENSITIVE);

    @Override
    public String generateQrCodeUrl(Long amount, String transferContent) {
        try {
            String cleanAcc = (accountNumber != null && !accountNumber.isBlank()) ? accountNumber.trim() : "103874683969";
            String cleanBank = (bankCode != null && !bankCode.isBlank()) ? bankCode.trim() : "VietinBank";

            String encodedDes = URLEncoder.encode(transferContent, StandardCharsets.UTF_8);

            // Sử dụng chuẩn mã QR chính thức từ máy chủ SePay
            return String.format("https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%d&des=%s&template=compact",
                    cleanAcc, cleanBank, amount, encodedDes);
        } catch (Exception e) {
            log.error("Error generating SePay QR URL: {}", e.getMessage());
            return String.format("https://qr.sepay.vn/img?acc=%s&bank=VietinBank&amount=%d&des=%s",
                    accountNumber, amount, transferContent);
        }
    }

    @Override
    public Long extractOrderCodeFromContent(String content) {
        if (content == null || content.isBlank()) {
            return null;
        }

        // Bước 1: Tìm theo tiền tố rõ ràng (SEVQR, JLMS...)
        Matcher matcher = PREFIX_PATTERN.matcher(content.trim());
        if (matcher.find()) {
            try {
                return Long.parseLong(matcher.group(1));
            } catch (NumberFormatException e) {
                log.warn("Could not parse number from prefix regex match: {}", matcher.group(1));
            }
        }

        // Bước 2: Thử tìm chuỗi số liên tiếp 6-10 chữ số
        Pattern numberPattern = Pattern.compile("(\\d{6,10})");
        Matcher numMatcher = numberPattern.matcher(content);
        while (numMatcher.find()) {
            try {
                return Long.parseLong(numMatcher.group(1));
            } catch (NumberFormatException ignored) {}
        }

        return null;
    }

    @Override
    public boolean checkRecentTransactionsViaApi(Long orderCode, Long expectedAmount) {
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("SEPAY_API_KEY")) {
            return false;
        }

        try {
            String url = "https://my.sepay.vn/userapi/transactions/list?limit=20";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey.trim());
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List<Map<String, Object>> transactions = (List<Map<String, Object>>) body.get("transactions");
                if (transactions != null) {
                    for (Map<String, Object> tx : transactions) {
                        String txContent = (String) tx.get("transaction_content");
                        if (txContent == null) txContent = (String) tx.get("content");

                        Long extractedCode = extractOrderCodeFromContent(txContent);
                        if (extractedCode != null && extractedCode.equals(orderCode)) {
                            Object amountInObj = tx.get("amount_in");
                            double amountIn = amountInObj != null ? Double.parseDouble(amountInObj.toString()) : 0;
                            if (amountIn >= (expectedAmount != null ? expectedAmount : 0)) {
                                log.info("Matched transaction from SePay API for orderCode={}: amount={}", orderCode, amountIn);
                                return true;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not query SePay transactions API: {}", e.getMessage());
        }

        return false;
    }
}
