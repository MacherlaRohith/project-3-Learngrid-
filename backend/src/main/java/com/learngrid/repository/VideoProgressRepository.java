package com.learngrid.repository;

import com.learngrid.model.VideoProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface VideoProgressRepository extends JpaRepository<VideoProgress, Long> {
    
    // Aggregates drop-offs by minute
    @Query("SELECT v.stopMinute as minute, COUNT(v) as count " +
           "FROM VideoProgress v " +
           "WHERE v.lesson.id = :lessonId " +
           "GROUP BY v.stopMinute " +
           "ORDER BY v.stopMinute ASC")
    List<Map<String, Object>> findDropOffRatesByLesson(@Param("lessonId") Long lessonId);
    
    // Aggregates drop-offs for an entire course
    @Query("SELECT v.stopMinute as minute, COUNT(v) as count " +
           "FROM VideoProgress v " +
           "WHERE v.lesson.course.id = :courseId " +
           "GROUP BY v.stopMinute " +
           "ORDER BY v.stopMinute ASC")
    List<Map<String, Object>> findDropOffRatesByCourse(@Param("courseId") Long courseId);

    // Get specific student progress
    VideoProgress findByStudentIdAndLessonId(Long studentId, Long lessonId);
}
