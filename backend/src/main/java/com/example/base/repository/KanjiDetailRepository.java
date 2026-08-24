package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.KanjiDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Chứa các biến thể truy vấn màn Kanji cần: toàn bộ, theo module, theo JLPT và tìm kiếm.
 * Lọc ở database giúp không phải tải toàn bộ kho Kanji về bộ nhớ Java.
 */
public interface KanjiDetailRepository extends JpaRepository<KanjiDetail, Long> {
    // Lấy toàn bộ theo thứ tự ổn định khi không có filter/search.
    List<KanjiDetail> findByOrderByKanjiIdAsc();

    // Lay cac kanji detail thuoc mot module, sap xep tang dan theo kanjiId.
    List<KanjiDetail> findByModule_ModuleIdOrderByKanjiIdAsc(Long moduleId);

    // Dem so kanji detail trong module, dung de hien thi kanjiCount o module DTO.
    long countByModule_ModuleId(Long moduleId);

    // Lay cac kanji detail theo JLPT level cua module cha.
    @Query("select k from KanjiDetail k where k.module.jlptLevel = :jlptLevel order by k.kanjiId")
    List<KanjiDetail> findByJlptLevel(@Param("jlptLevel") JlptLevel jlptLevel);

    // coalesce đổi null thành chuỗi rỗng để LIKE vẫn chạy với onyomi/kunyomi tùy chọn.
    @Query("select k from KanjiDetail k where " +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%')) " +
            "order by k.kanjiId")
    List<KanjiDetail> search(@Param("keyword") String keyword);

    // Điều kiện module nằm ngoài nhóm OR để không trả nhầm Kanji của module khác.
    @Query("select k from KanjiDetail k where k.module.moduleId = :moduleId and (" +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%'))) " +
            "order by k.kanjiId")
    List<KanjiDetail> searchByModule(@Param("moduleId") Long moduleId, @Param("keyword") String keyword);

    // JLPT nằm ở module cha nên JPQL truy cập qua k.module.jlptLevel.
    @Query("select k from KanjiDetail k where k.module.jlptLevel = :jlptLevel and (" +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%'))) " +
            "order by k.kanjiId")
    List<KanjiDetail> searchByJlptLevel(@Param("jlptLevel") JlptLevel jlptLevel,
                                        @Param("keyword") String keyword);
}
