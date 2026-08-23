package com.example.base.service.course.impl;

import com.example.base.dto.course.CourseRequest;
import com.example.base.dto.course.CourseResponse;
import com.example.base.entity.*;
import com.example.base.exception.AppException;
import com.example.base.exception.ErrorCode;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.mapper.CourseMapper;
import com.example.base.repository.AccountRepository;
import com.example.base.repository.CourseRepository;
import com.example.base.repository.EnrollmentRepository;
import com.example.base.service.course.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final AccountRepository accountRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseMapper courseMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<CourseResponse> getAllCourses(String keyword, JlptLevel jlptLevel, Pageable pageable, String currentEmail) {
        Page<Course> page;
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        boolean hasLevel = jlptLevel != null;

        if (hasKeyword && hasLevel) {
            page = courseRepository.findByJlptLevelAndTitleContainingIgnoreCase(jlptLevel, keyword.trim(), pageable);
        } else if (hasKeyword) {
            page = courseRepository.findByTitleContainingIgnoreCase(keyword.trim(), pageable);
        } else if (hasLevel) {
            page = courseRepository.findByJlptLevel(jlptLevel, pageable);
        } else {
            page = courseRepository.findAll(pageable);
        }

        Long currentStudentId = null;
        if (currentEmail != null && !currentEmail.isBlank()) {
            Account acc = accountRepository.findByEmail(currentEmail).orElse(null);
            if (acc != null) {
                currentStudentId = acc.getAccountId();
            }
        }

        final Long studentId = currentStudentId;
        return page.map(course -> {
            boolean isEnrolled = false;
            if (studentId != null) {
                isEnrolled = enrollmentRepository.existsByStudent_AccountIdAndCourse_CourseId(studentId, course.getCourseId());
            }
            return courseMapper.toResponse(course, isEnrolled);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long courseId, String currentEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        boolean isEnrolled = false;
        if (currentEmail != null && !currentEmail.isBlank()) {
            Account acc = accountRepository.findByEmail(currentEmail).orElse(null);
            if (acc != null) {
                isEnrolled = enrollmentRepository.existsByStudent_AccountIdAndCourse_CourseId(acc.getAccountId(), courseId);
            }
        }

        return courseMapper.toResponse(course, isEnrolled);
    }

    @Override
    @Transactional
    public CourseResponse createCourse(CourseRequest request, String creatorEmail) {
        String cleanTitle = request.getTitle().trim();

        // 1. Kiểm tra tính duy nhất của tên khóa học
        if (courseRepository.existsByTitleIgnoreCase(cleanTitle)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tên khóa học '" + cleanTitle + "' đã tồn tại trong hệ thống. Vui lòng chọn tên khác!");
        }

        Account creator = accountRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", creatorEmail));

        Course course = courseMapper.toEntity(request);
        course.setTitle(cleanTitle);
        course.setCreatedBy(creator);
        if (course.getPrice() == null) {
            course.setPrice(0L);
        }

        Course saved = courseRepository.save(course);
        log.info("Created course id={}, title='{}', price={} VND by user {}", saved.getCourseId(), saved.getTitle(), saved.getPrice(), creatorEmail);

        return courseMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseRequest request, String userEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        Account currentUser = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", userEmail));

        // Kiểm tra quyền: Manager hoặc chính tác giả tạo khóa học
        boolean isOwner = course.getCreatedBy() != null && course.getCreatedBy().getAccountId().equals(currentUser.getAccountId());
        boolean isManager = currentUser.getRole() == Role.Manager;

        if (!isOwner && !isManager) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền chỉnh sửa khóa học này!");
        }

        String cleanTitle = request.getTitle().trim();
        // Kiểm tra trùng tên với khóa học khác
        if (courseRepository.existsByTitleIgnoreCaseAndCourseIdNot(cleanTitle, courseId)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tên khóa học '" + cleanTitle + "' đã được sử dụng bởi khóa học khác!");
        }

        course.setTitle(cleanTitle);
        course.setJlptLevel(request.getJlptLevel());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice() != null ? request.getPrice() : 0L);

        Course updated = courseRepository.save(course);
        log.info("Updated course id={}, title='{}', price={} VND by user {}", updated.getCourseId(), updated.getTitle(), updated.getPrice(), userEmail);

        return courseMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCourse(Long courseId, String userEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        Account currentUser = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", userEmail));

        boolean isOwner = course.getCreatedBy() != null && course.getCreatedBy().getAccountId().equals(currentUser.getAccountId());
        boolean isManager = currentUser.getRole() == Role.Manager;

        if (!isOwner && !isManager) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền xóa khóa học này!");
        }

        // Kiểm tra nếu đã có học viên đăng ký
        long enrolledCount = enrollmentRepository.countByCourse_CourseId(courseId);
        if (enrolledCount > 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa khóa học đã có " + enrolledCount + " học viên đăng ký học!");
        }

        courseRepository.delete(course);
        log.info("Deleted course id={} by user {}", courseId, userEmail);
    }

    @Override
    @Transactional
    public void enrollFreeCourse(Long courseId, String studentEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        if (course.getPrice() != null && course.getPrice() > 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Khóa học này là khóa trả phí (" + course.getPrice() + " VNĐ). Vui lòng thanh toán qua cổng SePay (VietQR)!");
        }

        Account student = accountRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", studentEmail));

        if (enrollmentRepository.existsByStudent_AccountIdAndCourse_CourseId(student.getAccountId(), courseId)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Bạn đã đăng ký khóa học này rồi!");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .progressPercent(BigDecimal.ZERO)
                .build();

        enrollmentRepository.save(enrollment);
        log.info("Student {} enrolled in free course {}", studentEmail, course.getTitle());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getMyEnrolledCourses(String studentEmail) {
        Account student = accountRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", studentEmail));

        List<Enrollment> enrollments = enrollmentRepository.findByStudent_AccountIdOrderByEnrolledAtDesc(student.getAccountId());
        return enrollments.stream()
                .map(e -> courseMapper.toResponse(e.getCourse(), true))
                .collect(Collectors.toList());
    }
}
