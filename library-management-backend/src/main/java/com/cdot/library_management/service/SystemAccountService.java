package com.cdot.library_management.service;

import com.cdot.library_management.dto.CreateSystemAccountRequest;
import com.cdot.library_management.dto.SystemAccountResponse;
import com.cdot.library_management.entity.SystemAccount;
import com.cdot.library_management.repository.SystemAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SystemAccountService {

    private final SystemAccountRepository systemAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public SystemAccountService(SystemAccountRepository systemAccountRepository,
                                 PasswordEncoder passwordEncoder) {
        this.systemAccountRepository = systemAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    
    //helper
    private SystemAccountResponse toResponse(SystemAccount account) {
        String createdBy = account.getCreatedBy() != null
                ? account.getCreatedBy().getUsername()
                : "system";
        return new SystemAccountResponse(
                account.getAccountId(),
                account.getAccountName(),
                account.getUsername(),
                account.getEmail(),
                account.getRole(),
                account.getIsActive(),
                createdBy,
                account.getCreatedAt(),
                account.getLastLogin()
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

        return toResponse(systemAccountRepository.save(account));
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
}