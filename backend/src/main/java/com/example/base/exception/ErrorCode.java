package com.example.base.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    SUCCESS(200, "Thành công", HttpStatus.OK),
    BAD_REQUEST(400, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401, "Chưa xác thực hoặc token không hợp lệ", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    NOT_FOUND(404, "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED(405, "Phương thức không được hỗ trợ", HttpStatus.METHOD_NOT_ALLOWED),
    CONFLICT(409, "Dữ liệu bị trùng lặp hoặc xung đột", HttpStatus.CONFLICT),
    INTERNAL_SERVER_ERROR(500, "Lỗi hệ thống máy chủ", HttpStatus.INTERNAL_SERVER_ERROR),

    // Account & Auth Errors
    ACCOUNT_NOT_FOUND(1001, "Tài khoản không tồn tại", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS(1002, "Email đã được đăng ký", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(1003, "Email hoặc mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    TOKEN_EXPIRED(1004, "Phiên đăng nhập đã hết hạn", HttpStatus.UNAUTHORIZED),
    ACCOUNT_INACTIVE(1005, "Tài khoản đang bị khóa hoặc ngưng hoạt động", HttpStatus.FORBIDDEN),

    // Course & Learning Errors
    COURSE_NOT_FOUND(2001, "Khóa học không tồn tại", HttpStatus.NOT_FOUND),
    ALREADY_ENROLLED(2002, "Học viên đã tham gia khóa học này rồi", HttpStatus.BAD_REQUEST),
    LESSON_NOT_FOUND(2003, "Bài học không tồn tại", HttpStatus.NOT_FOUND),

    // Content Errors
    VOCABULARY_CATEGORY_NOT_FOUND(3001, "Danh mục từ vựng không tồn tại", HttpStatus.NOT_FOUND),
    VOCABULARY_ITEM_NOT_FOUND(3002, "Từ vựng không tồn tại", HttpStatus.NOT_FOUND),
    KANJI_MODULE_NOT_FOUND(3003, "Module Kanji không tồn tại", HttpStatus.NOT_FOUND),
    KANJI_NOT_FOUND(3004, "Chữ Kanji không tồn tại", HttpStatus.NOT_FOUND),
    GRAMMAR_PATTERN_NOT_FOUND(3005, "Mẫu ngữ pháp không tồn tại", HttpStatus.NOT_FOUND),
    MOCK_TEST_NOT_FOUND(3006, "Bài thi thử không tồn tại", HttpStatus.NOT_FOUND),
    ARTICLE_NOT_FOUND(3007, "Bài viết văn hóa không tồn tại", HttpStatus.NOT_FOUND),
    QUESTION_ALREADY_EXISTS(3008,"Câu hỏi này đã tồn tại trong ngân hàng câu hỏi",HttpStatus.CONFLICT);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
