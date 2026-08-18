package com.example.base.repository;

import com.example.base.entity.CultureArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CultureArticleRepository extends JpaRepository<CultureArticle, Long>, JpaSpecificationExecutor<CultureArticle> {

    Optional<CultureArticle> findByArticleId(Long articleId);

    Page<CultureArticle> findByStatus(String status, Pageable pageable);

    @Query(value = "SELECT a FROM CultureArticle a WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR a.status = :status)",
           countQuery = "SELECT count(a) FROM CultureArticle a WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR a.status = :status)")
    Page<CultureArticle> searchArticles(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable
    );

    @Query(value = "SELECT a FROM CultureArticle a WHERE " +
           "a.author.accountId = :authorId AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR a.status = :status)",
           countQuery = "SELECT count(a) FROM CultureArticle a WHERE " +
           "a.author.accountId = :authorId AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR a.status = :status)")
    Page<CultureArticle> searchArticlesByAuthor(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("authorId") Long authorId,
            Pageable pageable
    );
}
