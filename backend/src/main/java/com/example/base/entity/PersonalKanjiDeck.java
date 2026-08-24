package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "PersonalKanjiDeck")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
/**
 * Bộ Kanji cá nhân do một học viên sở hữu. Mọi truy vấn sửa/xóa deck đều phải kết hợp
 * deckId với student.accountId để người dùng không thể thao tác deck của học viên khác.
 */
public class PersonalKanjiDeck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deck_id")
    private Long deckId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    // Account là chủ sở hữu thực tế; student_id được dùng trong các truy vấn kiểm tra ownership.
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
        // Khi tạo deck mới, backend tự gắn cả createdAt và updatedAt.
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        // Khi cập nhật metadata deck, chỉ thay updatedAt và giữ nguyên createdAt.
        updatedAt = LocalDateTime.now();
    }
}
