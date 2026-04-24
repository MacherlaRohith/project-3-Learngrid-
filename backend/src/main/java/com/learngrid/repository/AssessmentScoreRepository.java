package com.learngrid.repository;

import com.learngrid.model.AssessmentScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentScoreRepository extends JpaRepository<AssessmentScore, Long> {
    List<AssessmentScore> findByUserId(Long userId);
    List<AssessmentScore> findByCourseId(Long courseId);
    Optional<AssessmentScore> findByUserIdAndCourseId(Long userId, Long courseId);
}
