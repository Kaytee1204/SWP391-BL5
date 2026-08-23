package com.example.base.repository;

import com.example.base.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {

    Optional<Payment> findByOrderCode(Long orderCode);

    List<Payment> findByStudent_AccountIdOrderByCreatedAtDesc(Long studentId);

    Page<Payment> findByStudent_AccountIdOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    boolean existsByStudent_AccountIdAndCourse_CourseIdAndStatus(Long studentId, Long courseId, String status);

    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Payment> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    long countByStatus(String status);
}
