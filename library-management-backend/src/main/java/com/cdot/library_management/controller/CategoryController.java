package com.cdot.library_management.controller;

import com.cdot.library_management.entity.Category;
import com.cdot.library_management.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;

import java.util.List;

@RestController
@RequestMapping("/admin/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @PostMapping
    public ResponseEntity<?> addCategory(@RequestBody Category category) {
        try {
            if (categoryRepository.findByName(category.getName()).isPresent()) {
                return ResponseEntity.badRequest().body("Category already exists: " + category.getName());
            }
            Category saved = categoryRepository.save(category);
            return ResponseEntity.status(201).body(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(
            categoryRepository.findAll(Sort.by("categoryId"))
        );
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Integer categoryId,
            @RequestBody Category updatedCategory) {
                
        try {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            categoryRepository.findByName(updatedCategory.getName())
                    .filter(c -> !c.getCategoryId().equals(categoryId))
                    .ifPresent(c -> {
                        throw new RuntimeException("Category already exists: " + updatedCategory.getName());
                    });

            category.setName(updatedCategory.getName());
            Category saved = categoryRepository.save(category);

            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}