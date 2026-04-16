package com.cdot.library_management.controller;

import com.cdot.library_management.entity.Category;
import com.cdot.library_management.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Integer categoryId) {
        try {
            categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            categoryRepository.deleteById(categoryId);
            return ResponseEntity.ok("Category deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}