package com.cdot.library_management.service;

import com.cdot.library_management.dto.LoginRequest;
import com.cdot.library_management.dto.LoginResponse;
import com.cdot.library_management.entity.User;
import com.cdot.library_management.entity.UserRole;
import com.cdot.library_management.repository.UserRepository;
import com.cdot.library_management.repository.UserRoleRepository;
import com.cdot.library_management.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       UserRoleRepository userRoleRepository,
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByStaffNumber(request.getStaffNumber())
                .orElseThrow(() -> new RuntimeException("Invalid staff number or password"));

        if (!user.getIsActive()) {
            throw new RuntimeException("Your account has been deactivated. Please contact admin");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid staff number or password");
        }

        List<UserRole> userRoles = userRoleRepository.findByUser_UserId(user.getUserId());

        List<String> roles = userRoles.stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());

        String token = jwtUtil.generateToken(user.getStaffNumber(), roles);

        return new LoginResponse(
                token,
                user.getStaffNumber(),
                user.getName(),
                user.getEmail(),
                roles
        );
    }
}