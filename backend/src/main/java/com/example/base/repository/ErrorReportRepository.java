package com.example.base.repository;

import com.example.base.entity.ErrorReport;

import com.example.base.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ErrorReportRepository extends JpaRepository<ErrorReport, Long> {

    Page<ErrorReport> findByStudentId(Long studentId, Pageable pageable);
    Page<ErrorReport> findByStatus(ReportStatus status, Pageable pageable);

    boolean existsByStudentIdAndTargetTypeAndTargetIdAndStatus(Long studentId, String targetType, Long targetId, ReportStatus status);
}
