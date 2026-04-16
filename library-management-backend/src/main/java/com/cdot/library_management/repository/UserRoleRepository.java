package com.cdot.library_management.repository;

import com.cdot.library_management.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {
    List<UserRole> findByUser_UserId(Integer userId);
    List<UserRole> findByRole_RoleId(Integer roleId);
    Optional<UserRole> findByUser_UserIdAndRole_RoleId(Integer userId, Integer roleId);

    @Modifying
    @Query("DELETE FROM UserRole ur WHERE ur.user.userId = :userId")
    void deleteByUser_UserId(@Param("userId") Integer userId);

    void deleteByUser_UserIdAndRole_RoleId(Integer userId, Integer roleId);
}