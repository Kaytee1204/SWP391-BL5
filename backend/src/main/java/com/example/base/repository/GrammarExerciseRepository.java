package com.example.base.repository;

import com.example.base.entity.GrammarExercise;
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
public interface GrammarExerciseRepository extends JpaRepository<GrammarExercise, Long>, JpaSpecificationExecutor<GrammarExercise> {

    Optional<GrammarExercise> findByExerciseId(Long exerciseId);

    boolean existsByQuestionTextIgnoreCase(String questionText);

    boolean existsByQuestionTextIgnoreCaseAndExerciseIdNot(String questionText, Long exerciseId);

    @Query(value = "SELECT e FROM GrammarExercise e WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(e.questionText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(e.explanation) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:jlptLevel IS NULL OR e.jlptLevel = :jlptLevel)",
           countQuery = "SELECT count(e) FROM GrammarExercise e WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(e.questionText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(e.explanation) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:jlptLevel IS NULL OR e.jlptLevel = :jlptLevel)")
    Page<GrammarExercise> searchExercises(
            @Param("keyword") String keyword,
            @Param("jlptLevel") JlptLevel jlptLevel,
            Pageable pageable
    );

    @Query(value = "SELECT e FROM GrammarExercise e WHERE " +
           "e.createdBy.accountId = :lecturerId AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(e.questionText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(e.explanation) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:jlptLevel IS NULL OR e.jlptLevel = :jlptLevel)",
           countQuery = "SELECT count(e) FROM GrammarExercise e WHERE " +
           "e.createdBy.accountId = :lecturerId AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(e.questionText) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(e.explanation) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:jlptLevel IS NULL OR e.jlptLevel = :jlptLevel)")
    Page<GrammarExercise> searchExercisesByLecturer(
            @Param("keyword") String keyword,
            @Param("jlptLevel") JlptLevel jlptLevel,
            @Param("lecturerId") Long lecturerId,
            Pageable pageable
    );
}
