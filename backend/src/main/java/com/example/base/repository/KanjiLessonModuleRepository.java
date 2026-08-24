package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.KanjiLessonModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Tầng truy cập dữ liệu của Kanji module. Spring Data đọc tên method để tự sinh câu SQL,
 * vì vậy service chỉ chọn truy vấn có/không có bộ lọc thay vì tự viết logic lặp lại.
 */
public interface KanjiLessonModuleRepository extends JpaRepository<KanjiLessonModule, Long> {
    // Lấy module theo JLPT và giữ thứ tự ổn định cho bảng frontend.
    List<KanjiLessonModule> findByJlptLevelOrderByModuleIdAsc(JlptLevel jlptLevel);
    // Khi không chọn bộ lọc, trả toàn bộ module theo ID tăng dần.
    List<KanjiLessonModule> findByOrderByModuleIdAsc();
}
