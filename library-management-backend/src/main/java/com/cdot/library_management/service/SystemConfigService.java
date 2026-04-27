package com.cdot.library_management.service;

import com.cdot.library_management.entity.SystemConfig;
import com.cdot.library_management.repository.SystemConfigRepository;
import org.springframework.stereotype.Service;

@Service
public class SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;

    public SystemConfigService(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    public int getMaxBooksPerUser() {
        return getIntValue("max_books_per_user");
    }

    public int getLoanPeriodDays() {
        return getIntValue("loan_period_days");
    }

    public double getFinePerDay() {
        return getDoubleValue("fine_per_day");
    }

    public int getReminderDaysBefore() {
        return getIntValue("reminder_days_before");
    }

    public boolean isFineSystemEnabled() {
        return Boolean.parseBoolean(getValue("fine_system_enabled"));
    }

    public String getValue(String key) {
        return systemConfigRepository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElseThrow(() -> new RuntimeException("Config not found: " + key));
    }

    public void setValue(String key, String value) {
        SystemConfig config = systemConfigRepository.findByConfigKey(key)
                .orElseThrow(() -> new RuntimeException("Config not found: " + key));
        config.setConfigValue(value);
        systemConfigRepository.save(config);
    }

    private int getIntValue(String key) {
        return Integer.parseInt(getValue(key));
    }

    private double getDoubleValue(String key) {
        return Double.parseDouble(getValue(key));
    }
}