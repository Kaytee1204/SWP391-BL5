package com.example.base.repository;

import com.example.base.entity.GrammarPattern;
import com.example.base.entity.JlptLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GrammarPatternRepository extends JpaRepository<GrammarPattern, Long>, JpaSpecificationExecutor<GrammarPattern> {

    Optional<GrammarPattern> findByPatternId(Long patternId);

    @Query(value = "SELECT g FROM GrammarPattern g WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(g.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.structure) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.usageNote) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:jlptLevel IS NULL OR g.jlptLevel = :jlptLevel)",
           countQuery = "SELECT count(g) FROM GrammarPattern g WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(g.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.structure) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.usageNote) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:jlptLevel IS NULL OR g.jlptLevel = :jlptLevel)")
    Page<GrammarPattern> searchPatterns(
            @Param("keyword") String keyword,
            @Param("jlptLevel") JlptLevel jlptLevel,
            Pageable pageable
    );

    @Query(value = "SELECT g FROM GrammarPattern g WHERE " +
           "g.createdBy.accountId = :lecturerId AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(g.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.structure) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.usageNote) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:jlptLevel IS NULL OR g.jlptLevel = :jlptLevel)",
           countQuery = "SELECT count(g) FROM GrammarPattern g WHERE " +
           "g.createdBy.accountId = :lecturerId AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(g.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.structure) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.usageNote) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:jlptLevel IS NULL OR g.jlptLevel = :jlptLevel)")
    Page<GrammarPattern> searchPatternsByLecturer(
            @Param("keyword") String keyword,
            @Param("jlptLevel") JlptLevel jlptLevel,
            @Param("lecturerId") Long lecturerId,
            Pageable pageable
    );
}
