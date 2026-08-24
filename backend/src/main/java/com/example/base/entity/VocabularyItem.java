package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Biểu diễn một mục từ vựng thuộc một category. Trường word là cách viết bắt buộc;
 * kanji là tùy chọn, còn jlptLevel được suy ra từ category thay vì lưu lặp ở bảng này.
 */
@Entity
@Table(name = "VocabularyItem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    // Mỗi từ bắt buộc thuộc một category để có chủ đề và cấp độ JLPT xác định.
    private VocabularyCategory category;

    @Column(name = "word", nullable = false, length = 100)
    private String word;

    @Column(name = "kanji", length = 100)
    private String kanji;

    @Column(name = "reading", nullable = false, length = 150)
    private String reading;

    @Column(name = "meaning", nullable = false, length = 500)
    private String meaning;

    @Column(name = "example_sentence", columnDefinition = "NVARCHAR(MAX)")
    private String exampleSentence;

    @Column(name = "example_translation", columnDefinition = "NVARCHAR(MAX)")
    private String exampleTranslation;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        // Timestamp được tạo tại server ngay trước INSERT để dữ liệu luôn nhất quán.
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        // Không thay createdAt khi sửa nội dung từ vựng.
        this.updatedAt = LocalDateTime.now();
    }
}
