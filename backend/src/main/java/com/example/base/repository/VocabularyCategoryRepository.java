package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.VocabularyCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Truy cập category theo ID/JLPT. Tên method theo quy ước Spring Data nên framework
 * tự tạo truy vấn và ORDER BY, không cần SQL thủ công.
 */
public interface VocabularyCategoryRepository extends JpaRepository<VocabularyCategory, Long> {
    List<VocabularyCategory> findByJlptLevelOrderByCategoryIdAsc(JlptLevel jlptLevel);
    List<VocabularyCategory> findByOrderByCategoryIdAsc();
}
