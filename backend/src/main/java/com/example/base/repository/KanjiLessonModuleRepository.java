package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.KanjiLessonModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KanjiLessonModuleRepository extends JpaRepository<KanjiLessonModule, Long> {
    List<KanjiLessonModule> findByJlptLevelOrderByModuleIdAsc(JlptLevel jlptLevel);
    List<KanjiLessonModule> findByOrderByModuleIdAsc();
}
