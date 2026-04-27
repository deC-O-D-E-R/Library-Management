package com.cdot.library_management.repository;

import com.cdot.library_management.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {
    Optional<Book> findByIsbn(String isbn);
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByAuthorContainingIgnoreCase(String author);
    List<Book> findByCallNumberContainingIgnoreCase(String callNumber);
    List<Book> findByCategory_CategoryId(Integer categoryId);
    Optional<Book> findByTitleIgnoreCaseAndAuthorIgnoreCase(String title, String author);
}