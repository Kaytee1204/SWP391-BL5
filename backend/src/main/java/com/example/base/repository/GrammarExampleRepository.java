package com.example.base.repository;

import com.example.base.entity.GrammarExample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarExampleRepository extends JpaRepository<GrammarExample, Long> {


    List<GrammarExample> findByPattern_PatternId(Long patternId);
}