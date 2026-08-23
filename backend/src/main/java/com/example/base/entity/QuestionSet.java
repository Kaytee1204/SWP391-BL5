package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table ( name = "QuestionSet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionSet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_set_id")
    private Long questionSetId;

    @Column(name = "title", nullable = false,length =200)
    private String title;

    @Column(name="description", length = 10000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name="skill_type", nullable = false, length =20)
    private QuestionSkillType skillType;

    @Enumerated(EnumType.STRING)
    @Column(name="jlpt_level",nullable = false,length = 20)
    private JlptLevel jlptLevel;

    @Builder.Default
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 60;

    @ManyToOne
    @JoinColumn(name="created_by",nullable = false)
    private Account createBy;

    @Column(name="created_at",nullable = false,updatable = false)
    private LocalDateTime createdAt;

    @Column(name="updated_at",nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
