// src/main/java/com/example/base/entity/ErrorReport.java
package com.example.base.entity;

import com.example.base.entity.ReportStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "error_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id") // Thêm name
    private Long reportId;

    @Column(name = "student_id", nullable = false) // Thêm name
    private Long studentId;

    @Column(name = "target_type", nullable = false, length = 50) // Thêm name
    private String targetType;

    @Column(name = "target_id", nullable = false) // Thêm name
    private Long targetId;

    @Column(name = "description", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReportStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false) // Thêm name
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at") // Thêm name
    private LocalDateTime updatedAt;
}