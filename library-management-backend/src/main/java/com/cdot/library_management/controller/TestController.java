package com.cdot.library_management.controller;

import com.cdot.library_management.entity.Role;
import com.cdot.library_management.repository.RoleRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@RestController
@RequestMapping("/test")
// @RequestMapping("/secure")
public class TestController {

    @Autowired
    private RoleRepository roleRepository;
    
    @GetMapping("/check")
    public String check() {
        return "Hey there, this module is working fine";
    }

    @GetMapping("/sum")
    public int sum() {
        return 2+2;
    }

    @GetMapping("/roles")
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @GetMapping("/protected")
    public String protectedRoute() {
        return "You have access to this protected route";
    }
        
}