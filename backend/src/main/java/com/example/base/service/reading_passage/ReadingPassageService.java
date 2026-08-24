package com.example.base.service.reading_passage;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.reading_passage.request.ReadingPassageCreateRequest;
import com.example.base.dto.reading_passage.request.ReadingPassageUpdateRequest;
import com.example.base.dto.reading_passage.response.ReadingPassageResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;

import org.springframework.data.domain.Pageable;

public interface ReadingPassageService {

    PageResponse<ReadingPassageResponse> searchPassages(
        String keyword, JlptLevel jlptLevel, Pageable pageable
    );
    PageResponse<ReadingPassageResponse> searchMyPassages(
            String keyword,
            JlptLevel jlptLevel,
            UserPrincipal currentUser,
            Pageable pageable
    );

    ReadingPassageResponse getPassageById(Long passageId);

    ReadingPassageResponse createPassage(
            ReadingPassageCreateRequest request,
            UserPrincipal currentUser
    );

    ReadingPassageResponse updatePassage(
            Long passageId,
            ReadingPassageUpdateRequest request,
            UserPrincipal currentUser
    );

    void deletePassage(
            Long passageId,
            UserPrincipal currentUser
    );
}
