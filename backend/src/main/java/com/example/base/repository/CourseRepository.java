package com.example.base.repository;

import com.example.base.entity.Course;
import com.example.base.entity.JlptLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    boolean existsByTitleIgnoreCase(String title);

    boolean existsByTitleIgnoreCaseAndCourseIdNot(String title, Long courseId);

    Optional<Course> findByTitleIgnoreCase(String title);

    Page<Course> findByJlptLevel(JlptLevel jlptLevel, Pageable pageable);

    Page<Course> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    Page<Course> findByJlptLevelAndTitleContainingIgnoreCase(JlptLevel jlptLevel, String keyword, Pageable pageable);

    List<Course> findByCreatedBy_AccountIdOrderByCreatedAtDesc(Long accountId);
}
