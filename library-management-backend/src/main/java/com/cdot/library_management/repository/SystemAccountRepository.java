package com.cdot.library_management.repository;

import com.cdot.library_management.entity.SystemAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemAccountRepository extends JpaRepository<SystemAccount, Integer> {

    Optional<SystemAccount> findByUsername(String username);

    boolean existsByUsername(String username);

}