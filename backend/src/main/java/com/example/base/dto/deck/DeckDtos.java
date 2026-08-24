package com.example.base.dto.deck;

import com.example.base.dto.vocabulary.VocabDtos.VocabItemDto;
import com.example.base.entity.JlptLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Các object đi qua biên API của personal deck. Request chỉ chứa dữ liệu client được phép gửi;
 * DTO response được service ghép từ deck, owner và danh sách item để không trả thẳng JPA entity.
 */
public final class DeckDtos {
    private DeckDtos() {}

    @Data @NoArgsConstructor @AllArgsConstructor
    /** Dùng chung cho tạo và sửa deck; studentId luôn lấy từ JWT chứ không nhận từ request. */
    public static class CreateDeckRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must not exceed 150 characters")
        private String title;
        @Size(max = 500, message = "Description must not exceed 500 characters")
        private String description;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    /** Bản tóm tắt/chi tiết deck từ vựng; items có thể rỗng ở màn danh sách để giảm dữ liệu tải về. */
    public static class PersonalVocabDeckDto {
        private Long deckId;
        private Long studentId;
        private String studentName;
        private String title;
        private String description;
        private Integer totalItems;
        private List<VocabItemDto> items;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    /** Client chỉ cần gửi ID từ gốc; service sẽ kiểm tra từ tồn tại trước khi tạo khóa ghép. */
    public static class AddVocabToDeckRequest {
        @NotNull(message = "Vocabulary item ID is required")
        private Long vocabularyItemId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    /** Deck Kanji trả kèm item DTO vì mỗi item còn có ghi chú ghi nhớ riêng. */
    public static class PersonalKanjiDeckDto {
        private Long deckId;
        private Long studentId;
        private String studentName;
        private String title;
        private String description;
        private Integer totalItems;
        private List<PersonalKanjiDeckItemDto> items;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    /** Dữ liệu được làm phẳng từ PersonalKanjiDeckItem -> KanjiDetail -> KanjiLessonModule. */
    public static class PersonalKanjiDeckItemDto {
        private Long kanjiId;
        private Long moduleId;
        private String moduleTitle;
        private String character;
        private String onyomi;
        private String kunyomi;
        private String meaning;
        private String compoundWords;
        private JlptLevel jlptLevel;
        private String memorizationNote;
        private LocalDateTime addedAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    /** Thêm Kanji và ghi chú trong một request để chỉ cần một lần lưu xuống database. */
    public static class AddKanjiToDeckRequest {
        @NotNull(message = "Kanji ID is required")
        private Long kanjiId;
        @Size(max = 500, message = "Memorization note must not exceed 500 characters")
        private String memorizationNote;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateKanjiNoteRequest {
        @Size(max = 500, message = "Memorization note must not exceed 500 characters")
        private String memorizationNote;
    }
}
