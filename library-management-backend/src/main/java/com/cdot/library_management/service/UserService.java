package com.cdot.library_management.service;

import com.cdot.library_management.dto.UserRequestDTO;
import com.cdot.library_management.dto.UserResponseDTO;
import com.cdot.library_management.dto.ChangePasswordRequest;
import com.cdot.library_management.entity.Role;
import com.cdot.library_management.entity.User;
import com.cdot.library_management.entity.UserRole;
import com.cdot.library_management.repository.RoleRepository;
import com.cdot.library_management.repository.UserRepository;
import com.cdot.library_management.repository.UserRoleRepository;
import com.cdot.library_management.dto.BulkUploadResponse;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.List;
import java.util.stream.Collectors;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.time.LocalDate;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       UserRoleRepository userRoleRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    //add single user
    @Transactional
    public UserResponseDTO addUser(UserRequestDTO request) {

        if (userRepository.findByStaffNumber(request.getStaffNumber()).isPresent()) {
            throw new RuntimeException("Staff number already exists: " + request.getStaffNumber());
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setStaffNumber(request.getStaffNumber());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setDesignation(request.getDesignation());
        user.setEmail(request.getEmail());
        user.setDateOfJoining(request.getDateOfJoining());
        user.setDateOfSuperannuation(request.getDateOfSuperannuation());
        user.setDateOfResignation(request.getDateOfResignation());
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        List<String> assignedRoles = assignRoles(savedUser, request.getRoles());

        return mapToResponseDTO(savedUser, assignedRoles);
    }

    //edit user
    @Transactional
    public UserResponseDTO editUser(Integer userId, UserRequestDTO request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (!user.getStaffNumber().equals(request.getStaffNumber()) &&
                userRepository.findByStaffNumber(request.getStaffNumber()).isPresent()) {
            throw new RuntimeException("Staff number already exists: " + request.getStaffNumber());
        }

        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        user.setName(request.getName());
        user.setStaffNumber(request.getStaffNumber());
        user.setDesignation(request.getDesignation());
        user.setEmail(request.getEmail());
        user.setDateOfJoining(request.getDateOfJoining());
        user.setDateOfSuperannuation(request.getDateOfSuperannuation());
        user.setDateOfResignation(request.getDateOfResignation());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = userRepository.save(user);

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {

            userRoleRepository.deleteByUser_UserId(userId);
            userRoleRepository.flush();

            assignRoles(savedUser, request.getRoles());
        }

        List<String> roles = userRoleRepository.findByUser_UserId(userId)
                .stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());

        return mapToResponseDTO(savedUser, roles);
    }

    //deactivate user manually
    @Transactional
    public UserResponseDTO deactivateUser(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setIsActive(false);
        User savedUser = userRepository.save(user);

        List<String> roles = userRoleRepository.findByUser_UserId(userId)
                .stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());

        return mapToResponseDTO(savedUser, roles);
    }

    //get all users
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> {
                    List<String> roles = userRoleRepository.findByUser_UserId(user.getUserId())
                            .stream()
                            .map(ur -> ur.getRole().getRoleName())
                            .collect(Collectors.toList());
                    return mapToResponseDTO(user, roles);
                })
                .collect(Collectors.toList());
    }

    //get user by ID
    public UserResponseDTO getUserById(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<String> roles = userRoleRepository.findByUser_UserId(userId)
                .stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());

        return mapToResponseDTO(user, roles);
    }

    //get user by staff number
    public UserResponseDTO getUserByStaffNumber(String staffNumber) {

        User user = userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("User not found with staff number: " + staffNumber));

        List<String> roles = userRoleRepository.findByUser_UserId(user.getUserId())
                .stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());

        return mapToResponseDTO(user, roles);
    }

    //get active users only
    public List<UserResponseDTO> getActiveUsers() {
        return userRepository.findByIsActive(true)
                .stream()
                .map(user -> {
                    List<String> roles = userRoleRepository.findByUser_UserId(user.getUserId())
                            .stream()
                            .map(ur -> ur.getRole().getRoleName())
                            .collect(Collectors.toList());
                    return mapToResponseDTO(user, roles);
                })
                .collect(Collectors.toList());
    }

    //assign roles to user
    private List<String> assignRoles(User user, List<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            Role defaultRole = roleRepository.findByRoleName("EMPLOYEE")
                    .orElseThrow(() -> new RuntimeException("Default role EMPLOYEE not found"));
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(defaultRole);
            userRoleRepository.save(userRole);
            return List.of("EMPLOYEE");
        }

        return roleNames.stream().map(roleName -> {
            Role role = roleRepository.findByRoleName(roleName)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(role);
            userRoleRepository.save(userRole);
            return roleName;
        }).collect(Collectors.toList());
    }

    //map User entity to UserResponseDTO
    private UserResponseDTO mapToResponseDTO(User user, List<String> roles) {
        return new UserResponseDTO(
                user.getUserId(),
                user.getName(),
                user.getStaffNumber(),
                user.getDesignation(),
                user.getEmail(),
                user.getDateOfJoining(),
                user.getDateOfSuperannuation(),
                user.getDateOfResignation(),
                user.getIsActive(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                roles
        );
    }

    public BulkUploadResponse bulkUploadUsers(MultipartFile file) {

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new RuntimeException("Invalid file");
        }

        if (filename.endsWith(".csv")) {
            return bulkUploadFromCSV(file);
        } else if (filename.endsWith(".xlsx")) {
            return bulkUploadFromExcel(file);
        } else {
            throw new RuntimeException("Only .csv and .xlsx files are supported");
        }
    }

    private BulkUploadResponse bulkUploadFromCSV(MultipartFile file) {

        List<BulkUploadResponse.BulkUploadError> errors = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line;
            int rowNum = 0;

            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (rowNum == 1) continue;

                String[] cols = line.split(",");
                totalRows++;

                try {
                    UserRequestDTO dto = mapColumnsToDTO(cols, rowNum);
                    addUser(dto);
                    successRows++;
                } catch (Exception e) {
                    String staffNum = cols.length > 1 ? cols[1].trim() : "N/A";
                    errors.add(new BulkUploadResponse.BulkUploadError(
                            rowNum, staffNum, e.getMessage()));
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to read CSV file: " + e.getMessage());
        }

        return new BulkUploadResponse(totalRows, successRows, totalRows - successRows, errors);
    }

    private BulkUploadResponse bulkUploadFromExcel(MultipartFile file) {

        List<BulkUploadResponse.BulkUploadError> errors = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            for (int rowNum = 1; rowNum <= sheet.getLastRowNum(); rowNum++) {
                Row row = sheet.getRow(rowNum);
                if (row == null) continue;

                totalRows++;

                try {
                    String[] cols = new String[9];
                    for (int i = 0; i < 9; i++) {
                        cols[i] = row.getCell(i) != null
                                ? formatter.formatCellValue(row.getCell(i)) : "";
                    }
                    UserRequestDTO dto = mapColumnsToDTO(cols, rowNum + 1);
                    addUser(dto);
                    successRows++;
                } catch (Exception e) {
                    String staffNum = formatter.formatCellValue(row.getCell(1));
                    errors.add(new BulkUploadResponse.BulkUploadError(
                            rowNum + 1, staffNum, e.getMessage()));
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to read Excel file: " + e.getMessage());
        }

        return new BulkUploadResponse(totalRows, successRows, totalRows - successRows, errors);
    }

    @Transactional
    public void changePassword(String staffNumber, ChangePasswordRequest request) {
        User user = userRepository.findByStaffNumber(staffNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserRequestDTO mapColumnsToDTO(String[] cols, int rowNum) {

        if (cols.length < 6) {
            throw new RuntimeException("Row " + rowNum + " has insufficient columns");
        }

        UserRequestDTO dto = new UserRequestDTO();
        dto.setName(cols[0].trim());
        dto.setStaffNumber(cols[1].trim());
        dto.setPassword(cols[2].trim());
        dto.setDesignation(cols[3].trim());
        dto.setEmail(cols[4].trim());
        dto.setDateOfJoining(parseDate(cols[5]));
        dto.setDateOfSuperannuation(
            cols.length > 6 ? parseDate(cols[6]) : null
        );
        dto.setDateOfResignation(
            cols.length > 7 ? parseDate(cols[7]) : null
        );
        dto.setRoles(cols.length > 8 && !cols[8].trim().isEmpty()
                ? List.of(cols[8].trim().split(";")) : List.of("EMPLOYEE"));

        return dto;
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) return null;

        dateStr = dateStr.trim();

        DateTimeFormatter[] formats = new DateTimeFormatter[]{
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy")
        };

        for (DateTimeFormatter formatter : formats) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (Exception ignored) {}
        }

        throw new RuntimeException("Invalid date format: " + dateStr);
    }

}