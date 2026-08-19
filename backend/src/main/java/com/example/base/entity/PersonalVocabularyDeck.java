package com.example.base.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/*
 * Một bộ từ vựng cá nhân do học viên tự tạo.
 * Ánh xạ 1-1 với bảng PersonalVocabularyDeck trong SQL Server.
 */
@Entity
@Table(name = "PersonalVocabularyDeck")
@Getter
@Setter
@NoArgsConstructor
public class PersonalVocabularyDeck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deck_id")
    private Long deckId;

    /*
     * Học viên sở hữu bộ từ vựng này.
     * NHIỀU deck thuộc về MỘT account, nên dùng @ManyToOne.
     * Cột student_id nằm trong bảng PersonalVocabularyDeck, trỏ sang Account.account_id.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Account student;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", length = 500)
    private String description;

    /*
     * Danh sách từ vựng nằm trong bộ này.
     *
     * Bảng PersonalVocabularyDeckItem chỉ là bảng nối, gồm đúng 2 khóa ngoại
     * (deck_id + vocabulary_item_id). Với loại bảng "chỉ để nối" như vậy,
     * @ManyToMany + @JoinTable là đủ - Hibernate tự thêm/xóa dòng trong đó.
     * Nhờ vậy không cần viết thêm 1 file entity riêng cho bảng nối.
     *
     * Cột added_at trong bảng nối do SQL Server tự điền (DEFAULT CURRENT_TIMESTAMP).
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "PersonalVocabularyDeckItem",
            joinColumns = @JoinColumn(name = "deck_id"),
            inverseJoinColumns = @JoinColumn(name = "vocabulary_item_id")
    )
    private List<VocabularyItem> items = new ArrayList<>();

    /*
     * Hai cột thời gian phải TỰ GÁN BẰNG TAY trong Controller:
     * - Lúc tạo mới: gán cả createdAt và updatedAt
     * - Lúc sửa:     gán lại updatedAt
     * Không dùng @PrePersist/@PreUpdate để mọi thứ đều nhìn thấy được trong code.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
