package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Enrollment", uniqueConstraints = {
        @UniqueConstraint(name = "uk_enrollment_student_course", columnNames = {"student_id", "course_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrollment_id")
    private Long enrollmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Account student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Column(name = "enrolled_at", nullable = false, updatable = false)
    private LocalDateTime enrolledAt;

    @Builder.Default
    @Column(name = "progress_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal progressPercent = BigDecimal.ZERO;

    @PrePersist
    protected void onCreate() {
        this.enrolledAt = LocalDateTime.now();
        if (this.progressPercent == null) {
            this.progressPercent = BigDecimal.ZERO;
        }
    }
}
