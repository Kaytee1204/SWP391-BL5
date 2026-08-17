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

    // Business Logic Errors
    USER_NOT_FOUND(1001, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS(1002, "Tên đăng nhập hoặc email đã tồn tại", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(1003, "Tài khoản hoặc mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    TOKEN_EXPIRED(1004, "Phiên đăng nhập đã hết hạn", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(1005, "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
