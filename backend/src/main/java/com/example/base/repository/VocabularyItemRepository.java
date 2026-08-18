package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.VocabularyItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VocabularyItemRepository extends JpaRepository<VocabularyItem, Long> {
    List<VocabularyItem> findByCategory_CategoryIdOrderByItemIdAsc(Long categoryId);

    long countByCategory_CategoryId(Long categoryId);

    @Query("select v from VocabularyItem v where v.category.jlptLevel = :jlptLevel order by v.itemId")
    List<VocabularyItem> findByJlptLevel(@Param("jlptLevel") JlptLevel jlptLevel);

    @Query("select v from VocabularyItem v where " +
            "lower(v.word) like lower(concat('%', :keyword, '%')) or " +
            "lower(v.reading) like lower(concat('%', :keyword, '%')) or " +
            "lower(v.meaning) like lower(concat('%', :keyword, '%')) or " +
            "lower(coalesce(v.kanji, '')) like lower(concat('%', :keyword, '%')) " +
            "order by v.itemId")
    List<VocabularyItem> search(@Param("keyword") String keyword);
}
