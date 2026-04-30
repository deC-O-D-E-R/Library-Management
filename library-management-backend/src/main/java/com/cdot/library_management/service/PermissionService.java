package com.cdot.library_management.service;

import com.cdot.library_management.entity.Permission;
import com.cdot.library_management.entity.SystemAccount;
import com.cdot.library_management.entity.SystemAccountPermission;
import com.cdot.library_management.repository.PermissionRepository;
import com.cdot.library_management.repository.SystemAccountPermissionRepository;
import com.cdot.library_management.repository.SystemAccountRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PermissionService {

    private final SystemAccountRepository systemAccountRepository;
    private final SystemAccountPermissionRepository systemAccountPermissionRepository;
    private final PermissionRepository permissionRepository;

    public PermissionService(SystemAccountRepository systemAccountRepository,
                              SystemAccountPermissionRepository systemAccountPermissionRepository,
                              PermissionRepository permissionRepository) {
        this.systemAccountRepository = systemAccountRepository;
        this.systemAccountPermissionRepository = systemAccountPermissionRepository;
        this.permissionRepository = permissionRepository;
    }

    //check if the currently logged-in system account has a permission
    //admins always pass — no DB check needed
    public boolean hasPermission(String permissionKey) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        SystemAccount account = systemAccountRepository.findByUsername(username)
                .orElse(null);

        if (account == null) return false;
        if ("ADMIN".equals(account.getRole())) return true;

        return systemAccountPermissionRepository
                .findByAccount_AccountId(account.getAccountId())
                .stream()
                .anyMatch(p -> p.getPermission().getPermissionKey().equals(permissionKey));
    }

    //get all permission keys for a given account
    public List<String> getPermissionKeys(Integer accountId) {
        return systemAccountPermissionRepository
                .findByAccount_AccountId(accountId)
                .stream()
                .map(p -> p.getPermission().getPermissionKey())
                .collect(Collectors.toList());
    }

    //assign permissions to an account — replaces existing ones
    @Transactional
    public void setPermissions(Integer accountId, List<String> permissionKeys) {
        SystemAccount account = systemAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        systemAccountPermissionRepository.deleteByAccount_AccountId(accountId);
        systemAccountPermissionRepository.flush();

        for (String key : permissionKeys) {
            Permission permission = permissionRepository.findByPermissionKey(key)
                    .orElseThrow(() -> new RuntimeException("Permission not found: " + key));

            SystemAccountPermission sap = new SystemAccountPermission();
            sap.setAccount(account);
            sap.setPermission(permission);
            systemAccountPermissionRepository.save(sap);
        }
    }
}