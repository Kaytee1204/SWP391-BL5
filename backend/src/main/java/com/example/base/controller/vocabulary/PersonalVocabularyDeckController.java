package com.example.base.controller.vocabulary;

import com.example.base.dto.common.ApiResponse;
import com.example.base.entity.Account;
import com.example.base.entity.PersonalVocabularyDeck;
import com.example.base.entity.VocabularyItem;
import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/*
 *   1. @PreAuthorize ở đầu class  -> chặn theo VAI TRÒ (bạn có phải Student không?)
 *   2. Hàm layDeckCuaToi()        -> chặn theo CHỦ SỞ HỮU (deck này có phải của bạn không?)
 * Thiếu lớp 2 thì mọi Student vẫn xem/sửa/xóa được deck của nhau.
 */
@RestController
@RequestMapping("/personal-vocabulary-decks")
@PreAuthorize("hasAnyAuthority('Student', 'ROLE_Student', 'ROLE_STUDENT', 'student')")
@Tag(name = "Personal Vocabulary Deck", description = "APIs cho Student tự quản lý bộ từ vựng riêng")
public class PersonalVocabularyDeckController {

    /*
     * EntityManager là công cụ nói chuyện với database.
     * Spring tự đưa nó vào nhờ @PersistenceContext.
     */
    @PersistenceContext
    private EntityManager entityManager;

    // ==========================================================
    // 1. XEM DANH SÁCH BỘ TỪ VỰNG CỦA MÌNH
    // ==========================================================

    @GetMapping
    @Operation(summary = "Xem danh sách bộ từ vựng của học viên đang đăng nhập")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<DeckResponse>>> xemDanhSachDeck(
            @AuthenticationPrincipal UserPrincipal nguoiDangDangNhap) {

        Long idHocVien = nguoiDangDangNhap.getAccountId();

        // Điều kiện WHERE deck.student.accountId = :idHocVien chính là thứ đảm bảo
        // học viên chỉ thấy deck của mình. Bỏ dòng đó đi là lộ dữ liệu của người khác.
        List<PersonalVocabularyDeck> danhSachDeck = entityManager
                .createQuery("""
                        SELECT deck
                        FROM PersonalVocabularyDeck deck
                        WHERE deck.student.accountId = :idHocVien
                        ORDER BY deck.updatedAt ASC
                        """, PersonalVocabularyDeck.class)
                .setParameter("idHocVien", idHocVien)
                .getResultList();

        // Đổi từng deck sang dạng JSON trả về.
        // Vì items khai LAZY, mỗi lần gọi deck.getItems() Hibernate chạy thêm 1 query.
        // Chấp nhận được với số lượng deck nhỏ, và bắt buộc phải nằm trong @Transactional.
        List<DeckResponse> ketQua = new ArrayList<>();
        for (PersonalVocabularyDeck deck : danhSachDeck) {
            ketQua.add(doiSangResponse(deck));
        }

        return ResponseEntity.ok(ApiResponse.success(ketQua));
    }

    // ==========================================================
    // 2. XEM DANH SÁCH TỪ VỰNG CÓ THỂ CHỌN
    //    (để giao diện hiện danh sách checkbox cho học viên tick)
    // ==========================================================

    @GetMapping("/tu-vung-co-the-chon")
    @Operation(summary = "Lấy toàn bộ từ vựng của hệ thống để chọn bỏ vào deck")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<WordResponse>>> xemTuVungCoTheChon() {

        List<VocabularyItem> danhSachTu = entityManager
                .createQuery("""
                        SELECT tuVung
                        FROM VocabularyItem tuVung
                        ORDER BY tuVung.itemId ASC
                        """, VocabularyItem.class)
                .getResultList();

        List<WordResponse> ketQua = new ArrayList<>();
        for (VocabularyItem tuVung : danhSachTu) {
            ketQua.add(doiTuVungSangResponse(tuVung));
        }

        return ResponseEntity.ok(ApiResponse.success(ketQua));
    }

    // ==========================================================
    // 3. TẠO BỘ TỪ VỰNG MỚI
    // ==========================================================

    @PostMapping
    @Operation(summary = "Tạo bộ từ vựng mới")
    @Transactional
    public ResponseEntity<ApiResponse<DeckResponse>> taoDeck(
            @AuthenticationPrincipal UserPrincipal nguoiDangDangNhap,
            @RequestBody DeckRequest duLieuGuiLen) {

        // ----------------------------------------------------------
        // KIỂM TRA DỮ LIỆU: sai thì dừng lại và báo lỗi ngay tại đây
        // ----------------------------------------------------------
        String ten = duLieuGuiLen.getTitle();

        if (ten == null || ten.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "Tên bộ từ vựng không được để trống"));
        }
        if (ten.length() > 150) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "Tên bộ từ vựng tối đa 150 ký tự"));
        }
        if (!ten.matches("^[\\p{L}\\p{N}\\s()_-]+$")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400,
                            "Tên bộ từ vựng chỉ được chứa chữ, số, dấu cách và các dấu - _ ( )"));
        }

        String moTa = duLieuGuiLen.getDescription();
        if (moTa != null && moTa.length() > 500) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "Mô tả tối đa 500 ký tự"));
        }

        // ----------------------------------------------------------
        // QUA ĐƯỢC HẾT CÁC IF Ở TRÊN = DỮ LIỆU HỢP LỆ, cho đi tiếp
        // ----------------------------------------------------------

        // Chủ sở hữu LẤY TỪ TOKEN. Client không có cách nào gửi student_id lên,
        // vì class DeckRequest bên dưới không hề có field đó.
        Long idHocVien = nguoiDangDangNhap.getAccountId();
        Account hocVien = entityManager.find(Account.class, idHocVien);

        LocalDateTime bayGio = LocalDateTime.now();

        PersonalVocabularyDeck deckMoi = new PersonalVocabularyDeck();
        deckMoi.setStudent(hocVien);
        deckMoi.setTitle(chuanHoaTen(duLieuGuiLen.getTitle()));
        deckMoi.setDescription(duLieuGuiLen.getDescription());
        deckMoi.setItems(layDanhSachTuVung(duLieuGuiLen.getVocabularyItemIds()));
        deckMoi.setCreatedAt(bayGio);   // gán tay vì entity không dùng @PrePersist
        deckMoi.setUpdatedAt(bayGio);   // gán tay vì entity không dùng @PreUpdate

        // persist() = câu lệnh INSERT.
        // Vì khóa chính khai GenerationType.IDENTITY nên Hibernate phải chạy INSERT
        // ngay lập tức để lấy id do SQL Server sinh ra, rồi gán ngược vào deckMoi.
        entityManager.persist(deckMoi);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo bộ từ vựng thành công", doiSangResponse(deckMoi)));
    }

    // ==========================================================
    // 4. SỬA BỘ TỪ VỰNG
    // ==========================================================

    @PutMapping("/{deckId}")
    @Operation(summary = "Sửa tên, mô tả và danh sách từ của một bộ từ vựng")
    @Transactional
    public ResponseEntity<ApiResponse<DeckResponse>> suaDeck(
            @AuthenticationPrincipal UserPrincipal nguoiDangDangNhap,
            @PathVariable Long deckId,
            @RequestBody DeckRequest duLieuGuiLen) {

        // ----------------------------------------------------------
        // KIỂM TRA DỮ LIỆU (giống hệt phần trong taoDeck ở trên).
        // Sửa luật ở đây thì nhớ sửa cả bên taoDeck cho khớp.
        // ----------------------------------------------------------
        String ten = duLieuGuiLen.getTitle();

        if (ten == null || ten.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "Tên bộ từ vựng không được để trống"));
        }
        if (ten.length() > 150) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "Tên bộ từ vựng tối đa 150 ký tự"));
        }
        if (!ten.matches("^[\\p{L}\\p{N}\\s()_-]+$")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400,
                            "Tên bộ từ vựng chỉ được chứa chữ, số, dấu cách và các dấu - _ ( )"));
        }

        String moTa = duLieuGuiLen.getDescription();
        if (moTa != null && moTa.length() > 500) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "Mô tả tối đa 500 ký tự"));
        }

        // ----------------------------------------------------------
        // QUA ĐƯỢC HẾT CÁC IF Ở TRÊN = DỮ LIỆU HỢP LỆ, cho đi tiếp
        // ----------------------------------------------------------

        Long idHocVien = nguoiDangDangNhap.getAccountId();


        PersonalVocabularyDeck deck = layDeckCuaToi(deckId, idHocVien);

        deck.setTitle(chuanHoaTen(duLieuGuiLen.getTitle()));
        deck.setDescription(duLieuGuiLen.getDescription());

        // Gán danh sách từ mới. Hibernate tự so sánh với danh sách cũ rồi
        // xóa/thêm các dòng tương ứng trong bảng nối PersonalVocabularyDeckItem.
        deck.setItems(layDanhSachTuVung(duLieuGuiLen.getVocabularyItemIds()));

        deck.setUpdatedAt(LocalDateTime.now());   // gán tay vì không dùng @PreUpdate

        // Không cần gọi lệnh UPDATE. Deck được load trong giao dịch nên Hibernate
        // đang theo dõi nó, thấy có thay đổi thì tự sinh câu UPDATE lúc kết thúc.
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật bộ từ vựng thành công", doiSangResponse(deck)));
    }

    // ==========================================================
    // 5. XÓA BỘ TỪ VỰNG
    // ==========================================================

    @DeleteMapping("/{deckId}")
    @Operation(summary = "Xóa một bộ từ vựng")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> xoaDeck(
            @AuthenticationPrincipal UserPrincipal nguoiDangDangNhap,
            @PathVariable Long deckId) {

        Long idHocVien = nguoiDangDangNhap.getAccountId();

        PersonalVocabularyDeck deck = layDeckCuaToi(deckId, idHocVien);

        // remove() xóa deck. Hibernate tự xóa các dòng trong bảng nối trước,
        // nên không bị lỗi vi phạm khóa ngoại.
        entityManager.remove(deck);

        return ResponseEntity.ok(ApiResponse.success("Xóa bộ từ vựng thành công", null));
    }

    // ==========================================================
    // CÁC HÀM PHỤ DÙNG CHUNG
    // ==========================================================

    /*
     * CHỐT CHẶN BẢO MẬT của cả feature.
     *
     * Câu truy vấn có ĐỒNG THỜI 2 điều kiện: đúng deckId VÀ đúng chủ sở hữu.
     * Deck của người khác sẽ không trả về dòng nào -> ném lỗi "không tìm thấy".
     *
     * Cách này an toàn hơn việc load deck ra rồi mới so sánh chủ sở hữu, vì
     * dữ liệu của người khác KHÔNG BAO GIỜ được đọc lên bộ nhớ.
     */
    private PersonalVocabularyDeck layDeckCuaToi(Long deckId, Long idHocVien) {

        List<PersonalVocabularyDeck> ketQua = entityManager
                .createQuery("""
                        SELECT deck
                        FROM PersonalVocabularyDeck deck
                        WHERE deck.deckId = :deckId
                          AND deck.student.accountId = :idHocVien
                        """, PersonalVocabularyDeck.class)
                .setParameter("deckId", deckId)
                .setParameter("idHocVien", idHocVien)
                .getResultList();

        if (ketQua.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy bộ từ vựng có id: " + deckId);
        }

        return ketQua.get(0);
    }


    private String chuanHoaTen(String tenGoc) {
        return tenGoc.trim().replaceAll("\\s+", " ");
    }

    /*
     * Đổi danh sách id [1, 5, 9] thành danh sách object VocabularyItem lấy từ database.
     * Xử lý luôn 3 tình huống dễ gây lỗi.
     */
    private List<VocabularyItem> layDanhSachTuVung(List<Long> danhSachId) {

        // Tình huống 1: không chọn từ nào -> deck rỗng, vẫn hợp lệ.
        if (danhSachId == null || danhSachId.isEmpty()) {
            return new ArrayList<>();
        }

        // Tình huống 2: client gửi id trùng, ví dụ [1, 1, 5].
        // Bảng nối có khóa chính kép (deck_id + vocabulary_item_id), chèn 2 dòng
        // giống hệt nhau sẽ vi phạm khóa chính và văng lỗi 500. Nên phải lọc trùng.
        List<Long> danhSachIdKhongTrung = danhSachId.stream().distinct().toList();

        List<VocabularyItem> danhSachTuVung = entityManager
                .createQuery("""
                        SELECT tuVung
                        FROM VocabularyItem tuVung
                        WHERE tuVung.itemId IN :danhSachId
                        """, VocabularyItem.class)
                .setParameter("danhSachId", danhSachIdKhongTrung)
                .getResultList();

        // Tình huống 3: client gửi id không tồn tại, ví dụ [1, 5, 999].
        // Câu truy vấn trên ÂM THẦM bỏ qua id sai, chỉ trả về 2 từ mà không báo gì.
        // Không kiểm tra thì học viên chọn 3 từ nhưng chỉ lưu được 2, mà vẫn báo thành công.
        if (danhSachTuVung.size() != danhSachIdKhongTrung.size()) {
            throw new BadRequestException("Danh sách từ vựng có id không tồn tại trong hệ thống");
        }

        return danhSachTuVung;
    }

    /*
     * Đổi entity PersonalVocabularyDeck sang dạng JSON trả về cho client.
     */
    private DeckResponse doiSangResponse(PersonalVocabularyDeck deck) {

        List<WordResponse> danhSachTu = new ArrayList<>();
        for (VocabularyItem tuVung : deck.getItems()) {
            danhSachTu.add(doiTuVungSangResponse(tuVung));
        }

        DeckResponse ketQua = new DeckResponse();
        ketQua.setDeckId(deck.getDeckId());
        ketQua.setTitle(deck.getTitle());
        ketQua.setDescription(deck.getDescription());
        ketQua.setTotalWords(danhSachTu.size());
        ketQua.setWords(danhSachTu);
        ketQua.setCreatedAt(deck.getCreatedAt());
        ketQua.setUpdatedAt(deck.getUpdatedAt());
        return ketQua;
    }

    /*
     * Đổi entity VocabularyItem sang dạng JSON trả về cho client.
     *
     * Bắt buộc phải có hàm này, không được trả thẳng VocabularyItem ra ngoài:
     * entity đó có field category (LAZY) kéo theo cả dây bảng khác, vừa gây lỗi
     * LazyInitializationException vừa làm JSON phình ra dữ liệu thừa.
     */
    private WordResponse doiTuVungSangResponse(VocabularyItem tuVung) {
        WordResponse ketQua = new WordResponse();
        ketQua.setItemId(tuVung.getItemId());
        ketQua.setWord(tuVung.getWord());
        ketQua.setKanji(tuVung.getKanji());
        ketQua.setReading(tuVung.getReading());
        ketQua.setMeaning(tuVung.getMeaning());
        return ketQua;
    }

    // ==========================================================
    // CÁC LỚP DỮ LIỆU (đặt lồng bên trong nên không tốn thêm file)
    // ==========================================================

    /*
     * Dữ liệu client GỬI LÊN khi tạo hoặc sửa bộ từ vựng.
     *
     * Chỉ có đúng 3 field. Đây chính là lớp bảo vệ: client gửi thêm
     * "student" hay "deckId" thì Spring cũng vứt bỏ, không có đường ghi đè.
     */
    @Getter
    @Setter
    public static class DeckRequest {

        // Không dùng annotation kiểm tra dữ liệu ở đây.
        // Toàn bộ việc kiểm tra được viết bằng if ngay trong taoDeck() và suaDeck()
        // để nhìn thấy rõ ràng từng bước, không có gì chạy ngầm.
        private String title;

        private String description;

        /** Danh sách id của các từ vựng muốn bỏ vào deck. Ví dụ: [1, 5, 9] */
        private List<Long> vocabularyItemIds = new ArrayList<>();
    }

    /**
     * Dữ liệu server TRẢ VỀ cho client.
     */
    @Getter
    @Setter
    public static class DeckResponse {

        private Long deckId;
        private String title;
        private String description;
        private int totalWords;              // để giao diện hiện "12 từ"
        private List<WordResponse> words;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    /**
     * Thông tin 1 từ vựng. Chỉ giữ 5 field cần cho việc học từ.
     */
    @Getter
    @Setter
    public static class WordResponse {

        private Long itemId;
        private String word;
        private String kanji;
        private String reading;
        private String meaning;
    }
}
