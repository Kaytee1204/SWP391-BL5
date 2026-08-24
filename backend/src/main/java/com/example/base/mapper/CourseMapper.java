package com.example.base.mapper;

import com.example.base.dto.course.CourseRequest;
import com.example.base.dto.course.CourseResponse;
import com.example.base.entity.Course;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public CourseResponse toResponse(Course entity) {
        if (entity == null) return null;

        return CourseResponse.builder()
                .courseId(entity.getCourseId())
                .jlptLevel(entity.getJlptLevel())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .price(entity.getPrice() != null ? entity.getPrice() : 0L)
                .createdById(entity.getCreatedBy() != null ? entity.getCreatedBy().getAccountId() : null)
                .createdByName(entity.getCreatedBy() != null ? entity.getCreatedBy().getFullName() : null)
                .createdByAvatarUrl(entity.getCreatedBy() != null ? entity.getCreatedBy().getAvatarUrl() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .totalLessons(entity.getLessons() != null ? entity.getLessons().size() : 0)
                .isEnrolled(false)
                .build();
    }

    public CourseResponse toResponse(Course entity, boolean isEnrolled) {
        CourseResponse response = toResponse(entity);
        if (response != null) {
            response.setIsEnrolled(isEnrolled);
        }
        return response;
    }

    public Course toEntity(CourseRequest request) {
        if (request == null) return null;

        return Course.builder()
                .jlptLevel(request.getJlptLevel())
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice() != null ? request.getPrice() : 0L)
                .build();
    }
}
