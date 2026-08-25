package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Bản ghi nguồn của màn 32-35. Mỗi từ thuộc một category và suy ra JLPT từ category cha;
 * personal deck chỉ tham chiếu itemId nên việc sửa nội dung nguồn được phản ánh khi học viên xem lại.
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

    // @Version phát hiện hai Lecturer cùng sửa. Hibernate từ chối request dùng version cũ,
    // nhờ đó người lưu sau không âm thầm ghi đè thay đổi đã commit của người lưu trước.
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
