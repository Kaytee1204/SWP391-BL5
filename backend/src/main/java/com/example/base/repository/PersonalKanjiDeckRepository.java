package com.example.base.repository;

import com.example.base.entity.PersonalKanjiDeck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/** Repository luôn có truy vấn theo studentId để bảo vệ quyền sở hữu ngay từ database. */
public interface PersonalKanjiDeckRepository extends JpaRepository<PersonalKanjiDeck, Long> {
    // Màn danh sách chỉ nhận deck của user đăng nhập, deck mới nhất đứng trước.
    List<PersonalKanjiDeck> findByStudent_AccountIdOrderByCreatedAtDesc(Long studentId);
    // Dùng cho đọc/sửa/xóa: sai owner cũng trả empty như deck không tồn tại.
    Optional<PersonalKanjiDeck> findByDeckIdAndStudent_AccountId(Long deckId, Long studentId);
}
