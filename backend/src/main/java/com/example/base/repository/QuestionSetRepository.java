package com.example.base.repository;

import com.example.base.entity.QuestionSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface QuestionSetRepository extends JpaRepository<QuestionSet,Long>, JpaSpecificationExecutor<QuestionSet> {

}
