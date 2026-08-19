package com.example.base.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "KanjiLessonModule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KanjiLessonModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "module_id")
    private Long moduleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "jlpt_level", nullable = false, length = 20)
    private JlptLevel jlptLevel;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private Account createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<KanjiDetail> kanjiList = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        // Khi tao kanji module moi, tu dong gan createdAt va updatedAt cung thoi diem hien tai.
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        // Khi cap nhat kanji module, chi lam moi updatedAt de theo doi lan sua cuoi.
        this.updatedAt = LocalDateTime.now();
    }
}
