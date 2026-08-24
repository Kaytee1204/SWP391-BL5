package com.example.base.service.deck;

import com.example.base.dto.deck.DeckDtos.*;

import java.util.List;

/**
 * Hợp đồng nghiệp vụ personal deck. Mọi method nhận studentId riêng để implementation
 * bắt buộc kiểm tra owner, thay vì để controller truy cập repository trực tiếp.
 */
public interface PersonalDeckService {
    // Nhóm vocabulary deck và Kanji deck dùng chung quy tắc owner nhưng trả DTO khác nhau.
    List<PersonalVocabDeckDto> getVocabDecks(Long studentId);
    PersonalVocabDeckDto getVocabDeck(Long deckId, Long studentId);
    PersonalVocabDeckDto createVocabDeck(CreateDeckRequest request, Long studentId);
    PersonalVocabDeckDto updateVocabDeck(Long deckId, CreateDeckRequest request, Long studentId);
    void deleteVocabDeck(Long deckId, Long studentId);
    void addVocabItem(Long deckId, AddVocabToDeckRequest request, Long studentId);
    void removeVocabItem(Long deckId, Long itemId, Long studentId);
    // Lấy tất cả personal Kanji deck của student.
    List<PersonalKanjiDeckDto> getKanjiDecks(Long studentId);
    // Lấy chi tiết một personal Kanji deck kèm danh sách item.
    PersonalKanjiDeckDto getKanjiDeck(Long deckId, Long studentId);
    // Tạo personal Kanji deck mới cho Student.
    PersonalKanjiDeckDto createKanjiDeck(CreateDeckRequest request, Long studentId);
    // Cập nhật title/description, không thay đổi danh sách Kanji bên trong.
    PersonalKanjiDeckDto updateKanjiDeck(Long deckId, CreateDeckRequest request, Long studentId);
    // Xóa personal Kanji deck và các bản ghi liên kết bên trong.
    void deleteKanjiDeck(Long deckId, Long studentId);
    // Thêm Kanji hoặc cập nhật note nếu cặp deck-Kanji đã tồn tại.
    void addKanji(Long deckId, AddKanjiToDeckRequest request, Long studentId);
    // Cập nhật memorization note trên quan hệ deck-Kanji.
    void updateKanjiNote(Long deckId, Long kanjiId, UpdateKanjiNoteRequest request, Long studentId);
    // Xóa Kanji item khỏi deck cá nhân, không xóa Kanji nguồn.
    void removeKanji(Long deckId, Long kanjiId, Long studentId);
}
