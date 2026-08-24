package com.example.base.repository;

import com.example.base.entity.JlptLevel;
import com.example.base.entity.ListeningExercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ListeningExerciseRepository extends JpaRepository<ListeningExercise, Long> {

    @Query("""
            SELECT exercise FROM ListeningExercise exercise
            WHERE (:keyword IS NULL OR :keyword = ''
                OR LOWER(exercise.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(exercise.scriptText) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(exercise.translation) LIKE LOWER(CONCAT('%', :keyword, '%')))
            AND (:jlptLevel IS NULL OR exercise.jlptLevel = :jlptLevel)
            """)
    Page<ListeningExercise> search(
            @Param("keyword") String keyword,
            @Param("jlptLevel") JlptLevel jlptLevel,
            Pageable pageable
    );

    @Query("""
            SELECT exercise FROM ListeningExercise exercise
            WHERE exercise.createdBy.accountId = :lecturerId
            AND (:keyword IS NULL OR :keyword = ''
                OR LOWER(exercise.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(exercise.scriptText) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(exercise.translation) LIKE LOWER(CONCAT('%', :keyword, '%')))
            AND (:jlptLevel IS NULL OR exercise.jlptLevel = :jlptLevel)
            """)
    Page<ListeningExercise> searchMine(
            @Param("lecturerId") Long lecturerId,
            @Param("keyword") String keyword,
            @Param("jlptLevel") JlptLevel jlptLevel,
            Pageable pageable
    );
}
