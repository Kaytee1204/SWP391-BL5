package com.example.base.repository;

import com.example.base.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByStudent_AccountIdAndCourse_CourseId(Long studentId, Long courseId);

    boolean existsByStudent_AccountIdAndCourse_CourseId(Long studentId, Long courseId);

    List<Enrollment> findByStudent_AccountIdOrderByEnrolledAtDesc(Long studentId);

    long countByCourse_CourseId(Long courseId);
}
