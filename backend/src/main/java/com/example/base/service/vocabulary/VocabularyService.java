package com.example.base.service.vocabulary;

import com.example.base.dto.vocabulary.VocabDtos.VocabItemDto;
import com.example.base.dto.vocabulary.VocabDtos.VocabItemRequest;
import com.example.base.entity.JlptLevel;

import java.util.List;

/**
 * Định nghĩa thao tác đọc/tìm kiếm và CRUD mục từ vựng. Controller chỉ phụ thuộc interface này,
 * nên không cần biết dữ liệu được lọc hay ánh xạ DTO như thế nào.
 */
public interface VocabularyService {
    // Lấy danh sách theo bộ lọc; kết quả luôn là DTO, không để JPA entity đi ra biên HTTP.
    List<VocabItemDto> getItems(Long categoryId, JlptLevel jlptLevel, String search);
    // Dùng cho màn xem chi tiết hoặc nạp form sửa.
    VocabItemDto getItem(Long itemId);
    // lecturerId đến từ JWT để ghi dấu người tạo/người cập nhật một cách đáng tin cậy.
    VocabItemDto createItem(VocabItemRequest request, Long lecturerId);
    VocabItemDto updateItem(Long itemId, VocabItemRequest request, Long lecturerId);
    // Xóa bản ghi nguồn; ràng buộc khóa ngoại của deck sẽ bảo vệ dữ liệu đang được tham chiếu.
    void deleteItem(Long itemId);
}
