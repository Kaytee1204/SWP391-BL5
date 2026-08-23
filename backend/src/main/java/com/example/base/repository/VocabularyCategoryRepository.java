package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.VocabularyCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VocabularyCategoryRepository extends JpaRepository<VocabularyCategory, Long> {
    List<VocabularyCategory> findByJlptLevelOrderByCategoryIdAsc(JlptLevel jlptLevel);
    List<VocabularyCategory> findByOrderByCategoryIdAsc();
    boolean existsByName(String name);
}
