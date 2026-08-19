package com.example.base.mapper;

import com.example.base.dto.questionbank.request.QuestionUpsertRequest;
import com.example.base.dto.questionbank.response.QuestionResponse;
import com.example.base.entity.Account;
import com.example.base.entity.QuestionBank;
import com.example.base.entity.QuestionType;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class QuestionBankMapper {

    private final ObjectMapper objectMapper;

    public QuestionBank toEntity(QuestionUpsertRequest request, Account creator){
        return QuestionBank.builder()
                .skillType(request.getSkillType())
                .jlptLevel(request.getJlptLevel())
                .questionText(request.getQuestionText())
                .questionType(request.getQuestionType())
                .choices(toChoicesJson(request))
                .correctAnswer(toJson(request.getCorrectAnswers()))
                .explanation(trimNullable(request.getExplanation()))
                .createdBy(creator)
                .build();
    }

    public void updateEntity(
            QuestionUpsertRequest request,
            QuestionBank entity
    ){
        entity.setSkillType(request.getSkillType());
        entity.setJlptLevel(request.getJlptLevel());
        entity.setQuestionText(request.getQuestionText().trim());
        entity.setQuestionType(request.getQuestionType());
        entity.setChoices(toChoicesJson(request));
        entity.setCorrectAnswer(toJson(request.getCorrectAnswers()));
        entity.setExplanation(trimNullable(request.getExplanation()));

    }

    public QuestionResponse toResponse(QuestionBank entity){
        Account creator = entity.getCreatedBy();

        return QuestionResponse.builder()
                .questionId(entity.getQuestionId())
                .skillType(entity.getSkillType())
                .jlptLevel(entity.getJlptLevel())
                .questionText(entity.getQuestionText())
                .questionType(entity.getQuestionType())
                .choices(fromJson(entity.getChoices()))
                .correctAnswers(fromJson(entity.getCorrectAnswer()))
                .explanation(entity.getExplanation())
                .createdById(creator!=null ? creator.getAccountId():null)
                .createdByName(creator!=null?creator.getFullName():null)
                .createdByEmail(creator!=null?creator.getEmail():null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private String toChoicesJson(QuestionUpsertRequest request){
        if(request.getQuestionType()== QuestionType.fill_blank){
            return null;
        }
        return toJson(request.getChoices());
    }

    private String toJson(List<String> values){
        try {
            List<String> normalized = values ==null
                    ? Collections.emptyList()
                    : values.stream()
                    .map(String::trim)
                    .filter(value->!value.isBlank())
                    .toList();
            return objectMapper.writeValueAsString(normalized);
        }catch (JsonProcessingException exception){
            throw new AppException(
                    ErrorCode.BAD_REQUEST,
                    "Không thể chuyển danh sách đáp án thành JSON"
            );
        }
    }

    private List<String> fromJson(String json){
        if(json==null||json.isBlank()){
            return Collections.emptyList();
        }

        try{
            return objectMapper.readValue(
                    json,
                    new TypeReference<List<String>>() {}
            );
        }catch (JsonProcessingException exception){
            throw new AppException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "Dữ liệu đáp án trong database không đúng định dạng JSON"
            );
        }
    }

    private String trimNullable(String value){
        return value == null || value.isBlank()?null:value.trim();
    }


 //mapper de anh xa giua java va json
    //fill_blanks khong can luu choices
}
