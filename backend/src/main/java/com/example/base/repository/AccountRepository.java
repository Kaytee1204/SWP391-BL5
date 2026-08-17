package com.example.base.repository;

import com.example.base.entity.Account;
import com.example.base.entity.AccountStatus;
import com.example.base.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByEmail(String email);

    Optional<Account> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndAccountIdNot(String email, Long accountId);

    Optional<Account> findByAccountIdAndDeletedAtIsNull(Long accountId);

    @Query("SELECT a FROM Account a WHERE " +
           "(:keyword IS NULL OR LOWER(a.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:role IS NULL OR a.role = :role) AND " +
           "(:status IS NULL OR a.status = :status)")
    Page<Account> searchAccounts(
            @Param("keyword") String keyword,
            @Param("role") Role role,
            @Param("status") AccountStatus status,
            Pageable pageable
    );
}
