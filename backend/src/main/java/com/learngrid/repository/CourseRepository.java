package com.learngrid.repository;

import com.learngrid.model.Course;
import com.learngrid.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructorId(Long instructorId);
    List<Course> findByInstructor(User instructor);
    long countByInstructor_Id(Long instructorId);

    List<Course> findByIsApprovedTrue();
    List<Course> findByIsApprovedFalse();
}
