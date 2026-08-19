package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.KanjiDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface KanjiDetailRepository extends JpaRepository<KanjiDetail, Long> {
    // Lay tat ca kanji detail, sap xep tang dan theo kanjiId.
    List<KanjiDetail> findByOrderByKanjiIdAsc();

    // Lay cac kanji detail thuoc mot module, sap xep tang dan theo kanjiId.
    List<KanjiDetail> findByModule_ModuleIdOrderByKanjiIdAsc(Long moduleId);

    // Dem so kanji detail trong module, dung de hien thi kanjiCount o module DTO.
    long countByModule_ModuleId(Long moduleId);

    // Lay cac kanji detail theo JLPT level cua module cha.
    @Query("select k from KanjiDetail k where k.module.jlptLevel = :jlptLevel order by k.kanjiId")
    List<KanjiDetail> findByJlptLevel(@Param("jlptLevel") JlptLevel jlptLevel);

    // Search toan bo kanji theo character, meaning, onyomi, hoac kunyomi.
    @Query("select k from KanjiDetail k where " +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%')) " +
            "order by k.kanjiId")
    List<KanjiDetail> search(@Param("keyword") String keyword);

    // Search kanji trong mot module cu the theo character, meaning, onyomi, hoac kunyomi.
    @Query("select k from KanjiDetail k where k.module.moduleId = :moduleId and (" +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%'))) " +
            "order by k.kanjiId")
    List<KanjiDetail> searchByModule(@Param("moduleId") Long moduleId, @Param("keyword") String keyword);

    // Search kanji trong mot JLPT level cu the theo character, meaning, onyomi, hoac kunyomi.
    @Query("select k from KanjiDetail k where k.module.jlptLevel = :jlptLevel and (" +
            "lower(k.character) like lower(concat('%', :keyword, '%')) or " +
            "lower(k.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.onyomi, '')) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(k.kunyomi, '')) like lower(concat('%', :keyword, '%'))) " +
            "order by k.kanjiId")
    List<KanjiDetail> searchByJlptLevel(@Param("jlptLevel") JlptLevel jlptLevel,
                                        @Param("keyword") String keyword);
}
