package com.example.base.service.course;

import com.example.base.dto.course.CourseRequest;
import com.example.base.dto.course.CourseResponse;
import com.example.base.entity.JlptLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CourseService {

    Page<CourseResponse> getAllCourses(String keyword, JlptLevel jlptLevel, Pageable pageable, String currentEmail);

    CourseResponse getCourseById(Long courseId, String currentEmail);

    CourseResponse createCourse(CourseRequest request, String creatorEmail);

    CourseResponse updateCourse(Long courseId, CourseRequest request, String userEmail);

    void deleteCourse(Long courseId, String userEmail);

    void enrollFreeCourse(Long courseId, String studentEmail);

    List<CourseResponse> getMyEnrolledCourses(String studentEmail);
}
