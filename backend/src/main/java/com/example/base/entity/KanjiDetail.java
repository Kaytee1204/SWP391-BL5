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

    @Column(name = "stroke_order_url", length = 500)
    private String strokeOrderUrl;

    @Column(name = "meaning", nullable = false, length = 300)
    private String meaning;

    @Column(name = "compound_words", columnDefinition = "NVARCHAR(MAX)")
    private String compoundWords;

    @Builder.Default
    @Column(name = "is_preview", nullable = false)
    private boolean isPreview = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
