package com.learngrid.repository;

import com.learngrid.model.Enrollment;
import com.learngrid.model.User;
import com.learngrid.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudent(User student);
    Optional<Enrollment> findByStudentAndCourse(User student, Course course);
    boolean existsByStudentAndCourse(User student, Course course);
    long countByStudent_Id(Long studentId);
    long countByCourse_Id(Long courseId);
    long countByCourse_IdAndCompleted(Long courseId, Boolean completed);
    List<Enrollment> findByCourseIdAndEnrolledAtAfter(Long courseId, java.time.LocalDateTime after);
    List<Enrollment> findByCourse_Instructor(User instructor);
}
