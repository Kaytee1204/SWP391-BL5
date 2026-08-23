package com.example.base.repository;

import com.example.base.entity.PersonalKanjiDeckItem;
import com.example.base.entity.PersonalKanjiDeckItemId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Repository của bảng liên kết, dùng PersonalKanjiDeckItemId làm kiểu khóa chính. */
public interface PersonalKanjiDeckItemRepository extends JpaRepository<PersonalKanjiDeckItem, PersonalKanjiDeckItemId> {
    // Chi tiết deck hiển thị nội dung mới thêm trước.
    List<PersonalKanjiDeckItem> findByDeck_DeckIdOrderByAddedAtDesc(Long deckId);
    // Dem so kanji item trong deck, dung de tinh totalItems.
    long countByDeck_DeckId(Long deckId);
    // Hai phép exists bảo vệ dữ liệu cá nhân: không xóa nguồn đang được deck tham chiếu.
    boolean existsByKanji_KanjiId(Long kanjiId);
    // Kiem tra module co kanji nao dang duoc luu trong personal deck khong.
    boolean existsByKanji_Module_ModuleId(Long moduleId);
}
