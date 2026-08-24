package com.example.base.mapper;

import com.example.base.dto.reading_passage.request.ReadingPassageCreateRequest;
import com.example.base.dto.reading_passage.request.ReadingPassageUpdateRequest;

import com.example.base.dto.reading_passage.response.ReadingPassageResponse;
import com.example.base.entity.Account;
import com.example.base.entity.ReadingPassage;
import org.springframework.stereotype.Component;

@Component
public class ReadingPassageMapper {

    public ReadingPassage toEntity(
            ReadingPassageCreateRequest request,
            Account creator,
            String sanitizedContent
            ){
        if(request==null){
            return null;
        }
        return ReadingPassage.builder()
                .jlptLevel(request.getJlptLevel())
                .title(request.getTitle().trim())
                .contentHtml(sanitizedContent)
                .translation(normalizedNullable(request.getTranslation()))
                .isPreview(request.isPreview())
                .createdBy(creator)
                .build();

    }

    public void updateEntity(ReadingPassageUpdateRequest request, ReadingPassage passage, String sanitizedContent){
        if(request.getJlptLevel()!=null){
            passage.setJlptLevel(request.getJlptLevel());
        }

        if(request.getTitle()!= null){
            passage.setTitle(request.getTitle());
        }

        if(request.getContentHtml()!=null){
            passage.setContentHtml(sanitizedContent);
        }

        if(request.getTranslation()!=null){
            passage.setTranslation(normalizedNullable(request.getTranslation()));
        }

        if(request.getIsPreview()!=null){
            passage.setPreview(request.getIsPreview());
        }

    }

    public ReadingPassageResponse toResponse(ReadingPassage passage){
        if(passage == null){
            return null;
        }
        Account creator = passage.getCreatedBy();
        return ReadingPassageResponse.builder()
                .passageId(passage.getPassageId())
                .jlptLevel(passage.getJlptLevel())
                .title(passage.getTitle())
                .contentHtml(passage.getContentHtml())
                .translation(normalizedNullable(passage.getTranslation()))
                .isPreview(passage.isPreview())
                .createdById(creator!=null ? creator.getAccountId():null)
                .createdByName(creator!=null ? creator.getFullName():"Unknown Lecturer")
                .createAt(passage.getCreatedAt())
                .updateAt(passage.getUpdatedAt())
                .build();

    }

    private String normalizedNullable(String value){
        if(value == null || value.isBlank()){
            return null;
        }
        return value.trim();
    }
}
