package com.example.base.repository;

import com.example.base.entity.QuestionSetItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface QuestionSetItemRepository extends JpaRepository<QuestionSetItem, Long> {

    List<QuestionSetItem> findByQuestionSetQuestionSetIdOrderByQuestionOrderAsc(Long questionSetId); //Lấy danh sách câu hỏi (theo thứ tự) thuộc về 1 bộ đề cụ thể

    boolean existsByQuestionSetQuestionSetIdAndQuestionQuestionId(Long questionSetId, Long questionId); //đã tồn tại câu hỏi trong bộ đề

    boolean existsByQuestionQuestionId(Long questionId); // Kiểm tra câu hỏi này đã được dùng trong bộ đề nào hay chưa (bất kể bộ đề nào)

    long countByQuestionSetQuestionSetId(Long questionSetId); //Đếm số lượng câu hỏi hiện có trong 1 bộ đề cụ thể

    void deleteByQuestionSetQuestionSetId(Long questionSetId); // Xóa toàn bộ các câu hỏi (item) thuộc về 1 bộ đề cụ thể (dùng khi xóa/làm lại bộ đề)
}
