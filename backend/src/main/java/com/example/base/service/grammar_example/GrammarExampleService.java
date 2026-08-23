package com.example.base.service.grammar_example;

import com.example.base.dto.grammar_example.GrammarExampleRequest;
import com.example.base.dto.grammar_example.GrammarExampleResponse;
import com.example.base.entity.GrammarExample;

import java.util.List;

public interface GrammarExampleService {

    List<GrammarExampleResponse> GetExampleByPatternId(Long patternId);
    GrammarExampleResponse getExampleById(Long exampleId);
    GrammarExampleResponse createExample(Long patternId, GrammarExampleRequest request);
    GrammarExampleResponse updateExample(Long exampleId, GrammarExampleRequest request);

    void DeleteExample(Long exampleId);
}
