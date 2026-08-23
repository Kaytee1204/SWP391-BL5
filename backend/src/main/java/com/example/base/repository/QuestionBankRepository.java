package com.example.base.repository;

import com.example.base.entity.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long>, JpaSpecificationExecutor<QuestionBank> {
    boolean existsByDuplicateHash(String duplicateHash); //check trung cau hoi
    boolean existsByDuplicateHashAndQuestionIdNot(String duplicateHash, Long questionId); //phục vụ cho việc update //
}

//jparepository cung cap crud(findById,findAll,save,delete)
//jpaSpecification ho tro filter theo keyword,skill,jlpt,questionType