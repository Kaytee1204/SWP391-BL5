package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Mot muc tu vung thuoc mot category; JLPT duoc suy ra tu category cha. */
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
    // createdBy khong thay doi sau khi record duoc tao, ke ca khi Lecturer khac chinh sua.
    private Account createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", nullable = false)
    // updatedBy thay doi moi khi co Lecturer chinh sua record.
    private Account updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // @Version giup phat hien 2 Lecturer cung sua mot record. Neu version trong database
    // da thay doi, Hibernate reject update de Lecturer sau khong ghi de du lieu cua Lecturer truoc.
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @PrePersist
    protected void onCreate() {
        // Timestamp do backend tao; frontend khong the gia mao ngay tao/cap nhat.
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        // Chi updatedAt thay doi khi edit; createdAt luon giu moc tao ban dau.
        this.updatedAt = LocalDateTime.now();
    }
}
