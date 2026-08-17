package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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

    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @Column(name = "example_sentence", columnDefinition = "NVARCHAR(MAX)")
    private String exampleSentence;

    @Column(name = "example_translation", columnDefinition = "NVARCHAR(MAX)")
    private String exampleTranslation;

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
