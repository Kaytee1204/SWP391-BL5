package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ListeningExercise")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListeningExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "listening_exercise_id")
    private Long listeningExerciseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "jlpt_level", nullable = false, length = 20)
    private JlptLevel jlptLevel;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "audio_url", nullable = false, length = 500)
    private String audioUrl;

    @Column(name = "audio_storage_name", nullable = false, length = 255)
    private String audioStorageName;

    @Column(name = "audio_original_name", nullable = false, length = 255)
    private String audioOriginalName;

    @Column(name = "script_text", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String scriptText;

    @Column(name = "translation", columnDefinition = "NVARCHAR(MAX)")
    private String translation;

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
