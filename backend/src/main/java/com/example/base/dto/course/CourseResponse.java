package com.example.base.dto.course;

import com.example.base.entity.JlptLevel;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponse {

    private Long courseId;
    private JlptLevel jlptLevel;
    private String title;
    private String description;
    private Long price;

    private Long createdById;
    private String createdByName;
    private String createdByAvatarUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Integer totalLessons;
    private Boolean isEnrolled;
}
