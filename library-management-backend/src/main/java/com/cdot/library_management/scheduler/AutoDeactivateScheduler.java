package com.cdot.library_management.scheduler;

import com.cdot.library_management.entity.User;
import com.cdot.library_management.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.List;

@Component
public class AutoDeactivateScheduler {

    private final UserRepository userRepository;

    public AutoDeactivateScheduler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void deactivateSuperannuatedUsers() {

        List<User> usersToDeactivate = userRepository
                .findByDateOfSuperannuationBeforeAndIsActive(LocalDate.now(), true);

        if (usersToDeactivate.isEmpty()) return;

        for (User user : usersToDeactivate) {
            user.setIsActive(false);
        }

        userRepository.saveAll(usersToDeactivate);

        System.out.println("Auto-deactivated " + usersToDeactivate.size() + " users on " + LocalDate.now());
    }

    @PostConstruct
    @Transactional
    public void runOnStartup() {
        deactivateSuperannuatedUsers();
    }

}