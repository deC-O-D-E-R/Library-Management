package com.cdot.library_management.service;

import com.cdot.library_management.dto.CreateSystemAccountRequest;
import com.cdot.library_management.dto.SystemAccountResponse;
import com.cdot.library_management.entity.SystemAccount;
import com.cdot.library_management.repository.SystemAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SystemAccountService {

    private final SystemAccountRepository systemAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final PermissionService permissionService;

    public SystemAccountService(SystemAccountRepository systemAccountRepository,
                                 PasswordEncoder passwordEncoder,
                                  PermissionService permissionService) {
        this.systemAccountRepository = systemAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.permissionService = permissionService;
    }

    
    //helper
    private SystemAccountResponse toResponse(SystemAccount account) {
        String createdBy = account.getCreatedBy() != null
                ? account.getCreatedBy().getUsername()
                : "system";
        List<String> permissions = permissionService.getPermissionKeys(account.getAccountId());
        return new SystemAccountResponse(
                account.getAccountId(),
                account.getAccountName(),
                account.getUsername(),
                account.getEmail(),
                account.getRole(),
                account.getIsActive(),
                createdBy,
                account.getCreatedAt(),
                account.getLastLogin(),
                permissions
        );
    }

    //get all system users

    public List<SystemAccountResponse> getAllAccounts() {
        return systemAccountRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    //create new system user
    public SystemAccountResponse createAccount(CreateSystemAccountRequest request, String createdByUsername) {
        if (systemAccountRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (!request.getRole().equals("ADMIN") && !request.getRole().equals("LIBRARIAN")) {
            throw new RuntimeException("Invalid role. Must be ADMIN or LIBRARIAN");
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        SystemAccount createdBy = systemAccountRepository.findByUsername(createdByUsername)
                .orElseThrow(() -> new RuntimeException("Creator account not found"));

        SystemAccount account = new SystemAccount();
        account.setAccountName(request.getAccountName());
        account.setUsername(request.getUsername());
        account.setEmail(request.getEmail());
        account.setRole(request.getRole());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setIsActive(true);
        account.setCreatedBy(createdBy);

        SystemAccount saved = systemAccountRepository.save(account);

        // assign permissions
        if (request.getPermissions() != null && !request.getPermissions().isEmpty()) {
            permissionService.setPermissions(saved.getAccountId(), request.getPermissions());
        }

        return toResponse(saved);
    }

    //deactivate a system user
    public void deactivateAccount(Integer accountId, String requestedByUsername) {
        SystemAccount account = systemAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getUsername().equals(requestedByUsername)) {
            throw new RuntimeException("You cannot deactivate your own account");
        }

        if (!account.getIsActive()) {
            throw new RuntimeException("Account is already deactivated");
        }

        account.setIsActive(false);
        systemAccountRepository.save(account);
    }

    @Transactional
    public SystemAccountResponse updatePermissions(Integer accountId, List<String> permissionKeys) {
        SystemAccount account = systemAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if ("ADMIN".equals(account.getRole())) {
            throw new RuntimeException("Admin accounts have all permissions by default");
        }

        permissionService.setPermissions(accountId, permissionKeys);
        return toResponse(account);
    }
}