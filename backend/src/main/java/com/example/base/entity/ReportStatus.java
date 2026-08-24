package com.example.base.entity;

public enum ReportStatus {

    PENDING,        // Chờ xử lý( mới gửi)
    IN_PROGRESS,    // Đang được Manager/ Lecture kiểm tra
    RESOLVED,       // Đã giải quyết xong
    CANCELLED,       //Học sinh tự hủy
    REJECTED
}
