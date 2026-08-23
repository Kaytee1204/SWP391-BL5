package com.example.base.controller.course;

import com.example.base.dto.common.ApiResponse;
import com.example.base.dto.course.CourseRequest;
import com.example.base.dto.course.CourseResponse;
import com.example.base.entity.JlptLevel;
import com.example.base.security.UserPrincipal;
import com.example.base.service.course.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@Tag(name = "Course Management", description = "APIs for Courses (Lecturer & Manager CRUD, Student Enroll)")
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @Operation(summary = "Get all courses with search, filter by JLPT level and pagination")
    public ResponseEntity<ApiResponse<Page<CourseResponse>>> getAllCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JlptLevel jlptLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = (sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1]))
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        String currentEmail = currentUser != null ? currentUser.getEmail() : null;

        Page<CourseResponse> result = courseService.getAllCourses(keyword, jlptLevel, pageable, currentEmail);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course details by ID")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String currentEmail = currentUser != null ? currentUser.getEmail() : null;
        CourseResponse response = courseService.getCourseById(id, currentEmail);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Create a new course (Lecturer / Manager only)")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CourseResponse response = courseService.createCourse(request, currentUser.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo khóa học mới thành công!", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Update course (Creator Lecturer or Manager)")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CourseResponse response = courseService.updateCourse(id, request, currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật khóa học thành công!", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Lecturer', 'ROLE_Lecturer', 'ROLE_LECTURER', 'lecturer', 'Manager', 'ROLE_Manager', 'ROLE_MANAGER', 'manager')")
    @Operation(summary = "Delete course (Creator Lecturer or Manager)")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        courseService.deleteCourse(id, currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Xóa khóa học thành công!", null));
    }

    @PostMapping("/{id}/enroll-free")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Self-enroll in free course (Price = 0)")
    public ResponseEntity<ApiResponse<Void>> enrollFreeCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        courseService.enrollFreeCourse(id, currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Đăng ký khóa học thành công! Chúc bạn học tốt.", null));
    }

    @GetMapping("/my-enrolled")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get list of courses enrolled by current user")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getMyEnrolledCourses(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<CourseResponse> list = courseService.getMyEnrolledCourses(currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
