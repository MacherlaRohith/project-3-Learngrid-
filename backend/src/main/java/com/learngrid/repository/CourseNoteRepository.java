package com.learngrid.repository;

import com.learngrid.model.CourseNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseNoteRepository extends JpaRepository<CourseNote, Long> {
    List<CourseNote> findByCourseIdOrderByCreatedAtDesc(Long courseId);
}
