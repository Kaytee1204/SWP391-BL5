package com.example.base.service.sepay;

public interface SePayService {

    String generateQrCodeUrl(Long amount, String transferContent);

    String getBankCode();

    String getAccountNumber();

    String getAccountName();

    Long extractOrderCodeFromContent(String content);

    /**
     * Tra cứu trực tiếp danh sách giao dịch gần nhất từ API của SePay
     * để tự động xác nhận thanh toán ngay lập tức khi học viên bấm kiểm tra
     */
    boolean checkRecentTransactionsViaApi(Long orderCode, Long expectedAmount);
}
