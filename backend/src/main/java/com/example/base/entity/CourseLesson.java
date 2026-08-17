package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CourseLesson")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseLesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lesson_id")
    private Long lessonId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "order_no", nullable = false)
    private Integer orderNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_type", nullable = false, length = 20)
    private SkillType skillType;

    @Column(name = "content_ref_id", nullable = false)
    private Long contentRefId;

    @Builder.Default
    @Column(name = "is_preview", nullable = false)
    private boolean isPreview = false;
}
