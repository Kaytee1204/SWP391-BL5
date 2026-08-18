package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.VocabularyCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabularyCategoryRepository extends JpaRepository<VocabularyCategory, Long> {
    List<VocabularyCategory> findByJlptLevel(JlptLevel jlptLevel);
}