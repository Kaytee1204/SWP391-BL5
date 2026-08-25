package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.KanjiDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Chứa các biến thể truy vấn màn Kanji cần: toàn bộ, theo module, theo JLPT và tìm kiếm.
 * Lọc ở database giúp không phải tải toàn bộ kho Kanji về bộ nhớ Java.
 */
public interface KanjiDetailRepository extends JpaRepository<KanjiDetail, Long> {
    @Override
    @EntityGraph(attributePaths = {"module", "createdBy", "updatedBy"})
    Optional<KanjiDetail> findById(Long id);

    // Lấy toàn bộ theo thứ tự ổn định khi không có filter/search.
    @EntityGraph(attributePaths = {"module", "createdBy", "updatedBy"})
    List<KanjiDetail> findByOrderByKanjiIdAsc();

    // Lấy các Kanji thuộc một module, sắp xếp ổn định theo kanjiId.
    @EntityGraph(attributePaths = {"module", "createdBy", "updatedBy"})
    List<KanjiDetail> findByModule_ModuleIdOrderByKanjiIdAsc(Long moduleId);

    // Đếm Kanji con để hiển thị kanjiCount ở module DTO mà không nạp collection LAZY.
    long countByModule_ModuleId(Long moduleId);

    // JLPT nằm ở module cha nên truy vấn đi qua quan hệ k.module.jlptLevel.
    @Query("select k from KanjiDetail k where k.module.jlptLevel = :jlptLevel order by k.kanjiId")
    @EntityGraph(attributePaths = {"module", "createdBy", "updatedBy"})
    List<KanjiDetail> findByJlptLevel(@Param("jlptLevel") JlptLevel jlptLevel);

    // coalesce đổi null thành chuỗi rỗng để LIKE vẫn chạy với onyomi/kunyomi tùy chọn.
    @Query("select k from KanjiDetail k where " +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%')) " +
            "order by k.kanjiId")
    @EntityGraph(attributePaths = {"module", "createdBy", "updatedBy"})
    List<KanjiDetail> search(@Param("keyword") String keyword);

    // Điều kiện module nằm ngoài nhóm OR để không trả nhầm Kanji của module khác.
    @Query("select k from KanjiDetail k where k.module.moduleId = :moduleId and (" +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%'))) " +
            "order by k.kanjiId")
    @EntityGraph(attributePaths = {"module", "createdBy", "updatedBy"})
    List<KanjiDetail> searchByModule(@Param("moduleId") Long moduleId, @Param("keyword") String keyword);

    // JLPT nằm ở module cha nên JPQL truy cập qua k.module.jlptLevel.
    @Query("select k from KanjiDetail k where k.module.jlptLevel = :jlptLevel and (" +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%'))) " +
            "order by k.kanjiId")
    @EntityGraph(attributePaths = {"module", "createdBy", "updatedBy"})
    List<KanjiDetail> searchByJlptLevel(@Param("jlptLevel") JlptLevel jlptLevel,
                                        @Param("keyword") String keyword);
}
