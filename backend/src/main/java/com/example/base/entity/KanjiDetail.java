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
/** Mot chu Kanji cu the trong kho hoc lieu. JLPT duoc lay qua module cha. */
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
