package com.example.base.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "GrammarExample")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarExample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "example_id")
    private Long exampleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pattern_id", nullable = false)
    private GrammarPattern pattern;

    @NotBlank(message = "Japanese sentence cannot be blank")
    @Column(name = "sentence_jp", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String sentenceJp;

    @NotBlank(message = "Translation cannot be blank")
    @Column(name = "translation", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String translation;

    @Size(max = 500, message = "Audio URL cannot exceed 500 characters")
    @Column(name = "audio_url", length = 500)
    private String audioUrl;

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
