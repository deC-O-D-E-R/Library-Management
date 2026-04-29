package com.cdot.library_management.controller;

import com.cdot.library_management.entity.SystemConfig;
import com.cdot.library_management.repository.SystemConfigRepository;
import com.cdot.library_management.service.SystemConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.nio.file.Path;
import java.nio.file.Paths;


@RestController
@RequestMapping("/admin/config")
public class SystemConfigController {

    private final SystemConfigRepository systemConfigRepository;
    private final SystemConfigService systemConfigService;

    public SystemConfigController(SystemConfigRepository systemConfigRepository,
                                   SystemConfigService systemConfigService) {
        this.systemConfigRepository = systemConfigRepository;
        this.systemConfigService = systemConfigService;
    }

    @GetMapping
    public ResponseEntity<List<SystemConfig>> getAllConfigs() {
        return ResponseEntity.ok(systemConfigRepository.findAll());
    }

    @PatchMapping("/{key}")
    public ResponseEntity<?> updateConfig(@PathVariable String key,
                                          @RequestParam String value) {
        try {
            systemConfigService.setValue(key, value);
            return ResponseEntity.ok("Config updated: " + key + " = " + value);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/files/{type}")
    public ResponseEntity<?> uploadOrUpdateFile(
            @PathVariable String type,
            @RequestParam("file") MultipartFile file) {

        try {
            String configKey;

            if ("rules".equalsIgnoreCase(type)) {
                configKey = "rules_pdf_path";
            } else if ("book-request".equalsIgnoreCase(type)) {
                configKey = "book_request_pdf_path";
            } else {
                return ResponseEntity.badRequest().body("Invalid file type");
            }

            String filePath = systemConfigService.getValue(configKey);

            Path path = Paths.get(filePath).toAbsolutePath().normalize();

            Files.createDirectories(path.getParent());

            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok("File updated successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}