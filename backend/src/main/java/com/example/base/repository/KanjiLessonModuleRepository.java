package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.KanjiLessonModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KanjiLessonModuleRepository extends JpaRepository<KanjiLessonModule, Long> {
    // Lay danh sach kanji module theo JLPT level, sap xep tang dan theo moduleId.
    List<KanjiLessonModule> findByJlptLevelOrderByModuleIdAsc(JlptLevel jlptLevel);
    // Lay tat ca kanji module, sap xep tang dan theo moduleId.
    List<KanjiLessonModule> findByOrderByModuleIdAsc();
}
