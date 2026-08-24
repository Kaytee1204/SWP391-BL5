package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "KanjiDetail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
/**
 * Một chữ Kanji cụ thể trong kho học liệu. Cấp độ JLPT không lưu trực tiếp ở đây mà
 * được lấy qua module cha, nhờ vậy khi đổi cấp độ module thì toàn bộ Kanji con đồng bộ theo.
 */
public class KanjiDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kanji_id")
    private Long kanjiId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    // Đây là phía giữ module_id, nên mỗi Kanji bắt buộc thuộc đúng một module bài học.
    private KanjiLessonModule module;

    @Column(name = "character", nullable = false, length = 10)
    private String character;

    @Column(name = "onyomi", length = 200)
    private String onyomi;

    @Column(name = "kunyomi", length = 200)
    private String kunyomi;

    @Column(name = "meaning", nullable = false, length = 300)
    private String meaning;

    @Column(name = "compound_words", columnDefinition = "NVARCHAR(MAX)")
    private String compoundWords;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        // Tự gắn thời gian trước khi INSERT, tránh phụ thuộc frontend phải gửi timestamp.
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        // Chỉ cập nhật mốc sửa cuối; ngày tạo ban đầu không được thay đổi.
        this.updatedAt = LocalDateTime.now();
    }
}
