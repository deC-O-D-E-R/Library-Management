package com.cdot.library_management.repository;

import com.cdot.library_management.entity.SystemAccountPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemAccountPermissionRepository extends JpaRepository<SystemAccountPermission, Integer> {
    List<SystemAccountPermission> findByAccount_AccountId(Integer accountId);
    void deleteByAccount_AccountId(Integer accountId);
}