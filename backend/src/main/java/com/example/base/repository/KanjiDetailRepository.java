package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.KanjiDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface KanjiDetailRepository extends JpaRepository<KanjiDetail, Long> {
    List<KanjiDetail> findByOrderByKanjiIdAsc();

    List<KanjiDetail> findByModule_ModuleIdOrderByKanjiIdAsc(Long moduleId);

    long countByModule_ModuleId(Long moduleId);

    @Query("select k from KanjiDetail k where k.module.jlptLevel = :jlptLevel order by k.kanjiId")
    List<KanjiDetail> findByJlptLevel(@Param("jlptLevel") JlptLevel jlptLevel);

    @Query("select k from KanjiDetail k where " +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%')) " +
            "order by k.kanjiId")
    List<KanjiDetail> search(@Param("keyword") String keyword);

    @Query("select k from KanjiDetail k where k.module.moduleId = :moduleId and (" +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%'))) " +
            "order by k.kanjiId")
    List<KanjiDetail> searchByModule(@Param("moduleId") Long moduleId, @Param("keyword") String keyword);

    @Query("select k from KanjiDetail k where k.module.jlptLevel = :jlptLevel and (" +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%'))) " +
            "order by k.kanjiId")
    List<KanjiDetail> searchByJlptLevel(@Param("jlptLevel") JlptLevel jlptLevel,
                                        @Param("keyword") String keyword);
}
