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
/**
 * Nhóm các chữ Kanji thành một module bài học theo cấp độ JLPT.
 * Một module là bảng cha: nhiều {@link KanjiDetail} cùng trỏ về module này để frontend
 * có thể lọc Kanji theo bài học hoặc theo JLPT mà không phải lặp lại thông tin cấp độ.
 */
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
    // Chỉ lưu khóa ngoại người tạo. LAZY giúp tránh tải toàn bộ Account khi chỉ cần danh sách module.
    private Account createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", nullable = false)
    // updatedBy đổi khi Lecturer sửa module; createdBy vẫn ghi nhận người tạo ban đầu.
    private Account updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // @Version phát hiện hai Lecturer cùng sửa và từ chối bản lưu dùng version đã cũ.
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Builder.Default
    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // mappedBy chỉ ra KanjiDetail.module là phía giữ khóa ngoại; xóa module sẽ xóa các Kanji con.
    private List<KanjiDetail> kanjiList = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        // JPA gọi hàm này ngay trước INSERT để hai mốc thời gian luôn có giá trị đồng nhất.
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        // Khi UPDATE chỉ đổi updatedAt; createdAt phải giữ nguyên để phản ánh đúng ngày tạo.
        this.updatedAt = LocalDateTime.now();
    }
}
