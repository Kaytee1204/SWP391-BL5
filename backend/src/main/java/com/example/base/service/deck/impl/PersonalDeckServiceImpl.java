package com.example.base.service.deck.impl;

import com.example.base.dto.deck.DeckDtos.*;
import com.example.base.dto.vocabulary.VocabDtos.VocabItemDto;
import com.example.base.entity.*;
import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.repository.*;
import com.example.base.service.deck.PersonalDeckService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
/**
 * Tập trung nghiệp vụ của cả vocabulary deck và Kanji deck. Class mặc định read-only để
 * các hàm xem dữ liệu nhẹ hơn; hàm có thay đổi database phải ghi đè bằng @Transactional.
 */
public class PersonalDeckServiceImpl implements PersonalDeckService {

    private final PersonalVocabularyDeckRepository vocabDeckRepository;
    private final PersonalVocabularyDeckItemRepository vocabItemRepository;
    private final PersonalKanjiDeckRepository kanjiDeckRepository;
    private final PersonalKanjiDeckItemRepository kanjiItemRepository;
    private final VocabularyItemRepository vocabularyRepository;
    private final KanjiDetailRepository kanjiRepository;
    private final AccountRepository accountRepository;

    @Override
    public List<PersonalVocabDeckDto> getVocabDecks(Long studentId) {
        // Luồng dữ liệu: accountId từ JWT -> kiểm tra Student -> query deck theo owner -> map summary DTO.
        requireStudent(studentId);
        return vocabDeckRepository.findByStudent_AccountIdOrderByCreatedAtDesc(studentId)
                .stream().map(this::toVocabDeckSummary).toList();
    }

    @Override
    public PersonalVocabDeckDto getVocabDeck(Long deckId, Long studentId) {
        // Kiểm tra ownership trước, sau đó mới tải item. Điều này ngăn lộ nội dung deck qua một ID đoán được.
        PersonalVocabularyDeck deck = requireOwnedVocabDeck(deckId, studentId);
        // Entity liên kết giữ VocabularyItem; map sang DTO để frontend nhận dữ liệu phẳng, không nhận JPA proxy.
        List<VocabItemDto> items = vocabItemRepository.findByDeck_DeckIdOrderByAddedAtDesc(deckId)
                .stream().map(i -> toVocabItemDto(i.getVocabularyItem())).toList();
        PersonalVocabDeckDto result = toVocabDeckSummary(deck);
        result.setItems(items);
        return result;
    }

    @Override
    @Transactional
    public PersonalVocabDeckDto createVocabDeck(CreateDeckRequest request, Long studentId) {
        // Owner không lấy từ request mà lấy từ token, nên client không thể tạo deck thay cho account khác.
        PersonalVocabularyDeck deck = PersonalVocabularyDeck.builder()
                .student(requireStudent(studentId))
                .title(request.getTitle().trim())
                .description(trimToNull(request.getDescription()))
                .build();
        return toVocabDeckSummary(vocabDeckRepository.save(deck));
    }

    @Override
    @Transactional
    public PersonalVocabDeckDto updateVocabDeck(Long deckId, CreateDeckRequest request, Long studentId) {
        PersonalVocabularyDeck deck = requireOwnedVocabDeck(deckId, studentId);
        deck.setTitle(request.getTitle().trim());
        deck.setDescription(trimToNull(request.getDescription()));
        return toVocabDeckSummary(vocabDeckRepository.save(deck));
    }

    @Override
    @Transactional
    public void deleteVocabDeck(Long deckId, Long studentId) {
        PersonalVocabularyDeck deck = requireOwnedVocabDeck(deckId, studentId);
        // Xóa bản ghi liên kết trước để không vi phạm khóa ngoại khi xóa deck cha.
        vocabItemRepository.deleteAll(vocabItemRepository.findByDeck_DeckIdOrderByAddedAtDesc(deckId));
        vocabDeckRepository.delete(deck);
    }

    @Override
    @Transactional
    public void addVocabItem(Long deckId, AddVocabToDeckRequest request, Long studentId) {
        PersonalVocabularyDeck deck = requireOwnedVocabDeck(deckId, studentId);
        // Nạp item gốc để chắc chắn ID frontend gửi lên thật sự tồn tại.
        VocabularyItem item = vocabularyRepository.findById(request.getVocabularyItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary item", "id", request.getVocabularyItemId()));
        PersonalVocabularyDeckItemId id = new PersonalVocabularyDeckItemId(deckId, item.getItemId());
        // Khóa ghép đồng thời là kiểm tra trùng: cùng một từ chỉ xuất hiện một lần trong một deck.
        if (!vocabItemRepository.existsById(id)) {
            vocabItemRepository.save(PersonalVocabularyDeckItem.builder()
                    .id(id).deck(deck).vocabularyItem(item).build());
        }
    }

    @Override
    @Transactional
    public void removeVocabItem(Long deckId, Long itemId, Long studentId) {
        // Phải xác minh owner trước khi dùng khóa ghép để xóa, nếu không user có thể xóa item của deck khác.
        requireOwnedVocabDeck(deckId, studentId);
        PersonalVocabularyDeckItemId id = new PersonalVocabularyDeckItemId(deckId, itemId);
        if (!vocabItemRepository.existsById(id)) throw new ResourceNotFoundException("Vocabulary item is not in this deck");
        vocabItemRepository.deleteById(id);
    }

    @Override
    public List<PersonalKanjiDeckDto> getKanjiDecks(Long studentId) {
        // Luồng tương tự vocabulary deck: xác nhận Student rồi chỉ lấy deck thuộc account này.
        requireStudent(studentId);
        return kanjiDeckRepository.findByStudent_AccountIdOrderByCreatedAtDesc(studentId)
                .stream().map(this::toKanjiDeckSummary).toList();
    }

    @Override
    public PersonalKanjiDeckDto getKanjiDeck(Long deckId, Long studentId) {
        // Summary chưa có danh sách item; khi mở chi tiết mới nạp item và gắn vào DTO để giảm dữ liệu ban đầu.
        PersonalKanjiDeck deck = requireOwnedKanjiDeck(deckId, studentId);
        List<PersonalKanjiDeckItemDto> items = kanjiItemRepository.findByDeck_DeckIdOrderByAddedAtDesc(deckId)
                .stream().map(this::toKanjiItemDto).toList();
        PersonalKanjiDeckDto result = toKanjiDeckSummary(deck);
        result.setItems(items);
        return result;
    }

    @Override
    @Transactional
    public PersonalKanjiDeckDto createKanjiDeck(CreateDeckRequest request, Long studentId) {
        // Owner lấy từ token; trim title và đổi mô tả rỗng thành null để dữ liệu lưu nhất quán.
        PersonalKanjiDeck deck = PersonalKanjiDeck.builder()
                .student(requireStudent(studentId))
                .title(request.getTitle().trim())
                .description(trimToNull(request.getDescription()))
                .build();
        return toKanjiDeckSummary(kanjiDeckRepository.save(deck));
    }

    @Override
    @Transactional
    public PersonalKanjiDeckDto updateKanjiDeck(Long deckId, CreateDeckRequest request, Long studentId) {
        // Chỉ owner được sửa title/description; item trong deck không bị ảnh hưởng bởi thao tác này.
        PersonalKanjiDeck deck = requireOwnedKanjiDeck(deckId, studentId);
        deck.setTitle(request.getTitle().trim());
        deck.setDescription(trimToNull(request.getDescription()));
        return toKanjiDeckSummary(kanjiDeckRepository.save(deck));
    }

    @Override
    @Transactional
    public void deleteKanjiDeck(Long deckId, Long studentId) {
        // Xác minh owner, xóa bảng liên kết trước, cuối cùng mới xóa deck cha để thỏa khóa ngoại.
        PersonalKanjiDeck deck = requireOwnedKanjiDeck(deckId, studentId);
        kanjiItemRepository.deleteAll(kanjiItemRepository.findByDeck_DeckIdOrderByAddedAtDesc(deckId));
        kanjiDeckRepository.delete(deck);
    }

    @Override
    @Transactional
    public void addKanji(Long deckId, AddKanjiToDeckRequest request, Long studentId) {
        // Nếu cặp deck-Kanji đã có thì tái sử dụng entity để cập nhật note; chưa có mới tạo bản ghi liên kết.
        PersonalKanjiDeck deck = requireOwnedKanjiDeck(deckId, studentId);
        KanjiDetail kanji = kanjiRepository.findById(request.getKanjiId())
                .orElseThrow(() -> new ResourceNotFoundException("Kanji", "id", request.getKanjiId()));
        PersonalKanjiDeckItemId id = new PersonalKanjiDeckItemId(deckId, kanji.getKanjiId());
        // orElseGet giúp thao tác này có tính "upsert": thêm mới hoặc cập nhật note bằng cùng một API.
        PersonalKanjiDeckItem item = kanjiItemRepository.findById(id)
                .orElseGet(() -> PersonalKanjiDeckItem.builder().id(id).deck(deck).kanji(kanji).build());
        item.setMemorizationNote(trimToNull(request.getMemorizationNote()));
        kanjiItemRepository.save(item);
    }
    @Override
    @Transactional
    public void updateKanjiNote(Long deckId, Long kanjiId, UpdateKanjiNoteRequest request, Long studentId) {
        // Kiểm tra deck thuộc user trước rồi mới tìm item bằng khóa ghép; thiếu item sẽ trả 404 rõ ràng.
        requireOwnedKanjiDeck(deckId, studentId);
        PersonalKanjiDeckItem item = kanjiItemRepository.findById(new PersonalKanjiDeckItemId(deckId, kanjiId))
                .orElseThrow(() -> new ResourceNotFoundException("Kanji is not in this deck"));
        item.setMemorizationNote(trimToNull(request.getMemorizationNote()));
        kanjiItemRepository.save(item);
    }
    @Override
    @Transactional
    public void removeKanji(Long deckId, Long kanjiId, Long studentId) {
        // Xóa đúng một quan hệ deck-Kanji, không xóa Kanji gốc trong kho học liệu.
        requireOwnedKanjiDeck(deckId, studentId);
        PersonalKanjiDeckItemId id = new PersonalKanjiDeckItemId(deckId, kanjiId);
        if (!kanjiItemRepository.existsById(id)) throw new ResourceNotFoundException("Kanji is not in this deck");
        kanjiItemRepository.deleteById(id);
    }

    private Account requireStudent(Long id) {
        // accountId đến từ JWT nhưng vẫn kiểm tra account còn hoạt động và đúng role Student trước khi làm owner.
        Account account = accountRepository.findByAccountIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));
        if (account.getRole() != Role.Student) throw new BadRequestException("Only students can own personal decks");
        return account;
    }

    private PersonalVocabularyDeck requireOwnedVocabDeck(Long deckId, Long studentId) {
        // Query theo hai điều kiện vừa tìm dữ liệu vừa thực thi ownership; không cần kiểm tra thủ công sau khi load.
        return vocabDeckRepository.findByDeckIdAndStudent_AccountId(deckId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary deck", "id", deckId));
    }

    private PersonalKanjiDeck requireOwnedKanjiDeck(Long deckId, Long studentId) {
        // Cùng nguyên tắc với vocab deck: deck sai owner được coi như không tồn tại.
        return kanjiDeckRepository.findByDeckIdAndStudent_AccountId(deckId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Kanji deck", "id", deckId));
    }

    private PersonalVocabDeckDto toVocabDeckSummary(PersonalVocabularyDeck deck) {
        // count query chỉ lấy một con số, nhẹ hơn việc nạp toàn bộ item chỉ để tính kích thước.
        return PersonalVocabDeckDto.builder()
                .deckId(deck.getDeckId()).studentId(deck.getStudent().getAccountId())
                .studentName(deck.getStudent().getFullName()).title(deck.getTitle())
                .description(deck.getDescription())
                .totalItems(Math.toIntExact(vocabItemRepository.countByDeck_DeckId(deck.getDeckId())))
                .createdAt(deck.getCreatedAt()).updatedAt(deck.getUpdatedAt()).build();
    }

    private PersonalKanjiDeckDto toKanjiDeckSummary(PersonalKanjiDeck deck) {
        // Map entity sang summary DTO và dùng count query thay vì tải cả collection item.
        return PersonalKanjiDeckDto.builder()
                .deckId(deck.getDeckId()).studentId(deck.getStudent().getAccountId())
                .studentName(deck.getStudent().getFullName()).title(deck.getTitle())
                .description(deck.getDescription())
                .totalItems(Math.toIntExact(kanjiItemRepository.countByDeck_DeckId(deck.getDeckId())))
                .createdAt(deck.getCreatedAt()).updatedAt(deck.getUpdatedAt()).build();
    }

    private PersonalKanjiDeckItemDto toKanjiItemDto(PersonalKanjiDeckItem item) {
        // Làm phẳng ba tầng item -> Kanji -> module để frontend render một object duy nhất.
        KanjiDetail kanji = item.getKanji();
        return PersonalKanjiDeckItemDto.builder()
                .kanjiId(kanji.getKanjiId()).moduleId(kanji.getModule().getModuleId())
                .moduleTitle(kanji.getModule().getTitle()).character(kanji.getCharacter())
                .onyomi(kanji.getOnyomi()).kunyomi(kanji.getKunyomi()).meaning(kanji.getMeaning())
                .compoundWords(kanji.getCompoundWords())
                .jlptLevel(kanji.getModule().getJlptLevel())
                .memorizationNote(item.getMemorizationNote()).addedAt(item.getAddedAt()).build();
    }

    private VocabItemDto toVocabItemDto(VocabularyItem item) {
        // Category name/JLPT được đưa thẳng vào DTO để màn deck không phải gọi API category lần nữa.
        return VocabItemDto.builder()
                .itemId(item.getItemId()).categoryId(item.getCategory().getCategoryId())
                .categoryName(item.getCategory().getName()).jlptLevel(item.getCategory().getJlptLevel())
                .word(item.getWord()).kanji(item.getKanji()).reading(item.getReading()).meaning(item.getMeaning())
                .exampleSentence(item.getExampleSentence())
                .exampleTranslation(item.getExampleTranslation())
                .createdAt(item.getCreatedAt()).updatedAt(item.getUpdatedAt()).build();
    }

    private String trimToNull(String value) {
        // Chuẩn hóa trường tùy chọn: blank thành null, còn nội dung thật được bỏ khoảng trắng hai đầu.
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
