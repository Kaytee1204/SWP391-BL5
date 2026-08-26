package com.example.base.repository;

import com.example.base.entity.QuestionSet;
import com.example.base.entity.QuestionSetPublicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface QuestionSetRepository extends JpaRepository<QuestionSet,Long>, JpaSpecificationExecutor<QuestionSet> {
    Page<QuestionSet> findByPublicationStatus(
            QuestionSetPublicationStatus publicationStatus,
            Pageable pageable
    );
}
