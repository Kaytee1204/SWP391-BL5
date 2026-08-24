package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.QuestionBank;
import com.example.base.entity.ReadingPassage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReadingPassageRepository extends JpaRepository<ReadingPassage, Long> {

    @Query("""
        SELECT r
        FROM ReadingPassage r
        WHERE (
            :keyword IS NULL
            OR :keyword = ''
            OR LOWER(r.title)
                LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(r.translation)
                LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        AND (
            :jlptLevel IS NULL
            OR r.jlptLevel = :jlptLevel
        )
        """)
    Page<ReadingPassage> searchPassages(
            @Param("keyword") String keyword,
            @Param("jlptLevel") JlptLevel jlptLevel,
            Pageable pageable
    );

    @Query("""
        SELECT r
        FROM ReadingPassage r
        WHERE r.createdBy.accountId = :lecturerId
        AND (
            :keyword IS NULL
            OR :keyword = ''
            OR LOWER(r.title)
                LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(r.translation)
                LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        AND (
            :jlptLevel IS NULL
            OR r.jlptLevel = :jlptLevel
        )
        """)
    Page<ReadingPassage> searchMyPassages(
            @Param("lecturerId") Long lecturerId,
            @Param("keyword") String keyword,
            @Param("jlptLevel") JlptLevel jlptLevel,
            Pageable pageable
    );
}
