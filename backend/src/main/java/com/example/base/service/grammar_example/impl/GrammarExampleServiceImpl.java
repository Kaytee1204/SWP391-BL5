package com.example.base.service.grammar_example.impl;

import com.example.base.dto.grammar_example.GrammarExampleRequest;
import com.example.base.dto.grammar_example.GrammarExampleResponse;
import com.example.base.entity.GrammarExample;
import com.example.base.entity.GrammarPattern;
import com.example.base.mapper.GrammarExampleMapper;
import com.example.base.repository.GrammarExampleRepository;
import com.example.base.repository.GrammarPatternRepository;
import com.example.base.service.grammar_example.GrammarExampleService;
import org.springframework.transaction.annotation.Transactional;
import lombok.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GrammarExampleServiceImpl implements GrammarExampleService {

    private final GrammarExampleRepository exampleRepository;
    private final GrammarPatternRepository patternRepository;
    private final GrammarExampleMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<GrammarExampleResponse> GetExampleByPatternId(Long patternId) {
    if(!patternRepository.existsById(patternId)){
        throw new RuntimeException("Mẫu ngữ pháp không tồn tại (ID: " + patternId +")");
        }
        List<GrammarExample> examples = exampleRepository.findByPattern_PatternId(patternId);
    return  examples.stream()
            .map(mapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarExampleResponse getExampleById(Long exampleId) {
      GrammarExample example = exampleRepository.findById(exampleId)
              .orElseThrow(() -> new RuntimeException("Không tim thấy câu ví dụ (ID: " + exampleId +")"));
    return mapper.toResponse(example);
    }

    @Override
    public GrammarExampleResponse createExample(Long patternId, GrammarExampleRequest request) {
        GrammarPattern pattern = patternRepository.findById(patternId)
                .orElseThrow(() -> new RuntimeException("Mẫu ngữ pháp không tồn tại (ID: " + patternId +")"));

               GrammarExample newExample = mapper.toEntity(request);
               newExample.setSentenceJp(request.getSentenceJp().trim());
               newExample.setTranslation(request.getTranslation().trim());
               newExample.setAudioUrl(trimToNull(request.getAudioUrl()));
                newExample.setPattern(pattern);
            GrammarExample saveExample = exampleRepository.save(newExample);
            return mapper.toResponse(saveExample);
    }

    @Override
    public GrammarExampleResponse updateExample(Long exampleId, GrammarExampleRequest request) {
     GrammarExample existingExample = exampleRepository.findById(exampleId)
             .orElseThrow(() -> new RuntimeException("Không tìm thấy câu ví dụ: (ID" + exampleId + ")"));

        existingExample.setSentenceJp(request.getSentenceJp().trim());
        existingExample.setTranslation(request.getTranslation().trim());

        existingExample.setAudioUrl(trimToNull(request.getAudioUrl()));

        GrammarExample updateExample = exampleRepository.save(existingExample);
        return mapper.toResponse(updateExample);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Override
    public void DeleteExample(Long exampleId) {
if(!exampleRepository.existsById(exampleId)){
    throw new RuntimeException("Không tìm thấy câu ví dụ để xóa (ID: " + exampleId + ")");
}
exampleRepository.deleteById(exampleId);
    }
}
