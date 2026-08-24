package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "ReadingPassage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ReadingPassage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // xác định khóa chính
    @Column(name = "passage_id")
    private Long passageId;


    @Enumerated(EnumType.STRING)
    @Column(name = "jlpt_level", nullable = false, length = 20)
    private JlptLevel jlptLevel;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name="content_furigana", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String contentHtml;

//    @Column(name = "translation", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    @Column(name = "translation",  columnDefinition = "NVARCHAR(MAX)")
    private String translation;

    @Builder.Default
    @Column(name = "is_preview",nullable = false)
    private boolean isPreview =false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private Account createdBy;

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
