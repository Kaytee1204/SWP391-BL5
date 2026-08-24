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
 * Bản ghi nguồn của màn 40-43. Module cha cung cấp nhóm bài và JLPT; personal Kanji deck
 * chỉ giữ tham chiếu tới kanjiId cùng ghi chú riêng, không sao chép nội dung chữ Kanji.
 */
public class KanjiDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kanji_id")
    private Long kanjiId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    // createdBy không đổi sau khi tạo, kể cả khi Lecturer khác chỉnh sửa.
    private Account createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", nullable = false)
    // updatedBy đổi mỗi khi có Lecturer chỉnh sửa bản ghi.
    private Account updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // @Version phát hiện hai Lecturer cùng sửa và chặn request mang dữ liệu cũ ghi đè dữ liệu mới.
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @PrePersist
    protected void onCreate() {
        // Timestamp do backend tạo; frontend không thể giả mạo ngày tạo/cập nhật.
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        // Chỉ updatedAt thay đổi khi edit; createdAt luôn giữ mốc tạo ban đầu.
        this.updatedAt = LocalDateTime.now();
    }
}
