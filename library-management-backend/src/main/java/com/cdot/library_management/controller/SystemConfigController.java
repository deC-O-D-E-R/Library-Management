package com.cdot.library_management.controller;

import com.cdot.library_management.entity.SystemConfig;
import com.cdot.library_management.repository.SystemConfigRepository;
import com.cdot.library_management.service.SystemConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}