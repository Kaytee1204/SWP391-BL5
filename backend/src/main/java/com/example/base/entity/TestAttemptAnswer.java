package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TestAttemptAnswer")
@IdClass(TestAttemptAnswerId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TestAttemptAnswer {
    @Id @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "attempt_id")
    private TestAttempt attempt;
    @Id @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "question_id")
    private QuestionBank question;
    @Column(name = "selected_answer", columnDefinition = "NVARCHAR(MAX)")
    private String selectedAnswer;
    @Column(name = "is_correct")
    private Boolean correct;
    @Column(name = "note", length = 1000)
    private String note;
    @Column(name = "answered_at")
    private LocalDateTime answeredAt;
    @PrePersist @PreUpdate protected void touch() { answeredAt = LocalDateTime.now(); }
}
