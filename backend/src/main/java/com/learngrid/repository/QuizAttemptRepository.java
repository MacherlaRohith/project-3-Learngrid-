package com.learngrid.repository;

import com.learngrid.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    @Query("SELECT q.quiz.question as question, " +
           "SUM(CASE WHEN q.isCorrect = false THEN 1 ELSE 0 END) * 100.0 / COUNT(q) as failureRate, " +
           "COUNT(q) as totalAttempts " +
           "FROM QuizAttempt q " +
           "WHERE q.quiz.lesson.course.id = :courseId " +
           "GROUP BY q.quiz.id, q.quiz.question " +
           "ORDER BY failureRate DESC")
    List<Map<String, Object>> findQuizDifficultyByCourse(@Param("courseId") Long courseId);
}
