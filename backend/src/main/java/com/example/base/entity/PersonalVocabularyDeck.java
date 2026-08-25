package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Bảng cha của màn 4-7: một bộ từ vựng cá nhân do đúng một học viên sở hữu.
 * Từ vựng bên trong nằm ở bảng liên kết PersonalVocabularyDeckItem, không lưu trực tiếp tại đây.
 */
@Entity
@Table(name = "PersonalVocabularyDeck")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalVocabularyDeck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deck_id")
    private Long deckId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    // student_id là dữ liệu ownership dùng kèm deckId trong mọi truy vấn đọc/sửa/xóa.
    private Account student;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        // Backend tự quản lý timestamp để client không thể giả mạo thời điểm tạo/cập nhật.
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        // Khi sửa metadata deck chỉ cập nhật updatedAt; createdAt luôn giữ nguyên.
        updatedAt = LocalDateTime.now();
    }
}
