package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "AISpeakingScenario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AISpeakingScenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scenario_id")
    private Long scenarioId;

    @Enumerated(EnumType.STRING)
    @Column(name = "jlpt_level", nullable = false, length = 20)
    private JlptLevel jlptLevel;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "target_role", length = 100)
    private String targetRole;

    @Column(name = "ai_role", length = 100)
    private String aiRole;

    @Column(name = "suggested_vocab", columnDefinition = "NVARCHAR(MAX)")
    private String suggestedVocab;

    @ManyToOne(fetch = FetchType.LAZY)
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
