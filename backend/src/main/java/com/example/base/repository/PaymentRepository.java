package com.example.base.repository;

import com.example.base.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderCode(Long orderCode);

    Page<Payment> findByOrderCode(Long orderCode, Pageable pageable);

    List<Payment> findByStudent_AccountIdOrderByCreatedAtDesc(Long studentId);

    Page<Payment> findByStudent_AccountId(Long studentId, Pageable pageable);

    boolean existsByStudent_AccountIdAndCourse_CourseIdAndStatus(Long studentId, Long courseId, String status);

    List<Payment> findByStatus(String status);

    Page<Payment> findByStatus(String status, Pageable pageable);

    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(p.amount), 0L) FROM Payment p WHERE LOWER(p.status) = 'paid'")
    Long sumTotalPaidRevenue();

    @Query(value = "SELECT p FROM Payment p LEFT JOIN p.student s LEFT JOIN p.course c " +
                   "WHERE LOWER(s.fullName) LIKE LOWER(CONCAT('%', :kw, '%')) " +
                   "OR LOWER(s.email) LIKE LOWER(CONCAT('%', :kw, '%')) " +
                   "OR LOWER(c.title) LIKE LOWER(CONCAT('%', :kw, '%'))",
           countQuery = "SELECT COUNT(p) FROM Payment p LEFT JOIN p.student s LEFT JOIN p.course c " +
                        "WHERE LOWER(s.fullName) LIKE LOWER(CONCAT('%', :kw, '%')) " +
                        "OR LOWER(s.email) LIKE LOWER(CONCAT('%', :kw, '%')) " +
                        "OR LOWER(c.title) LIKE LOWER(CONCAT('%', :kw, '%'))")
    Page<Payment> searchByKeyword(@Param("kw") String keyword, Pageable pageable);
}
