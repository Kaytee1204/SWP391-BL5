package com.example.base.repository;

import com.example.base.entity.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long>, JpaSpecificationExecutor<QuestionBank> {
}
//jparepository cung cap crud(findById,findAll,save,delete)
//jpaSpecification ho tro filter theo keyword,skill,jlpt,questionType