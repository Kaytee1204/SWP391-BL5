package com.example.base.service.grammar;

import com.example.base.dto.common.PageResponse;
import com.example.base.dto.grammar.GrammarPatternCreateRequest;
import com.example.base.dto.grammar.GrammarPatternResponse;
import com.example.base.dto.grammar.GrammarPatternUpdateRequest;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface GrammarPatternService {

    PageResponse<GrammarPatternResponse> searchPatterns(String keyword, JlptLevel jlptLevel, Pageable pageable);

    PageResponse<GrammarPatternResponse> searchMyPatterns(String keyword, JlptLevel jlptLevel, UserPrincipal currentUser, Pageable pageable);

    GrammarPatternResponse getPatternById(Long patternId);

    GrammarPatternResponse createPattern(GrammarPatternCreateRequest request, UserPrincipal currentUser);

    GrammarPatternResponse updatePattern(Long patternId, GrammarPatternUpdateRequest request, UserPrincipal currentUser);

    void deletePattern(Long patternId, UserPrincipal currentUser);
}
