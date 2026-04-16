package com.cdot.library_management.repository;

import com.cdot.library_management.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookCopyRepository extends JpaRepository<BookCopy, Integer> {
    Optional<BookCopy> findByAccessionNumber(String accessionNumber);
    List<BookCopy> findByBook_BookId(Integer bookId);
    List<BookCopy> findByStatus(String status);
    List<BookCopy> findByBook_BookIdAndStatus(Integer bookId, String status);
    long countByBook_BookIdAndStatus(Integer bookId, String status);
}