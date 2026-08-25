package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "QuestionBank")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBank {
// khai báo entity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_type", nullable = false, length = 20)
    private QuestionSkillType skillType;

    @Enumerated(EnumType.STRING)
    @Column(name = "jlpt_level", nullable = false, length = 20)
    private JlptLevel jlptLevel;

    @Column(name = "question_text", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 25)
    private QuestionType questionType;

    @Column(name = "choices", columnDefinition = "NVARCHAR(MAX)")
    private String choices;

    @Column(name = "correct_answer", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String correctAnswer;

    @Column(name = "explanation", columnDefinition = "NVARCHAR(MAX)")
    private String explanation;
    @Column(name = "duplicate_hash", nullable = false, length = 64)
    private String duplicateHash;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private Account createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reading_passage_id")
    private ReadingPassage readingPassage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listening_exercise_id")
    private ListeningExercise listeningExercise;

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
