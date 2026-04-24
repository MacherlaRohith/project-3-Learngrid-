package com.learngrid.controller;

import com.learngrid.model.*;
import com.learngrid.repository.*;
import com.learngrid.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
@Transactional
public class AnalyticsController {

    @Autowired
    private VideoProgressRepository videoProgressRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // --- STUDENT INGESTION ENDPOINTS ---

    @PostMapping("/video-heartbeat/{lessonId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> logVideoProgress(@PathVariable Long lessonId, @RequestParam int minute) {
        User student = getCurrentUser();
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(() -> new RuntimeException("Lesson not found"));

        VideoProgress vp = videoProgressRepository.findByStudentIdAndLessonId(student.getId(), lessonId);
        if (vp == null) {
            vp = VideoProgress.builder()
                    .student(student)
                    .lesson(lesson)
                    .stopMinute(minute)
                    .build();
        } else {
            // Keep the maximum reached so far (so we know their furthest dropoff)
            if (minute > vp.getStopMinute()) {
                vp.setStopMinute(minute);
            }
        }
        videoProgressRepository.save(vp);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/quiz-attempt/{quizId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> logQuizAttempt(@PathVariable Long quizId, @RequestParam boolean isCorrect) {
        User student = getCurrentUser();
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new RuntimeException("Quiz not found"));

        QuizAttempt attempt = QuizAttempt.builder()
                .student(student)
                .quiz(quiz)
                .isCorrect(isCorrect)
                .build();
        quizAttemptRepository.save(attempt);
        return ResponseEntity.ok().build();
    }

    // --- INSTRUCTOR DASHBOARD ENDPOINTS ---

    @GetMapping("/instructor/dropoff-rates/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getDropoffRates(@PathVariable Long courseId) {
        return ResponseEntity.ok(videoProgressRepository.findDropOffRatesByCourse(courseId));
    }

    @GetMapping("/instructor/quiz-difficulty/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getQuizDifficulty(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizAttemptRepository.findQuizDifficultyByCourse(courseId));
    }

    @GetMapping("/instructor/revenue")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getInstructorRevenue() {
        User instructor = getCurrentUser();
        List<Enrollment> enrollments = enrollmentRepository.findByCourse_Instructor(instructor);

        Map<String, Double> monthlyRevenue = new TreeMap<>(); // Sorted months automatically
        Map<String, Double> courseRevenue = new HashMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (Enrollment e : enrollments) {
            Course c = e.getCourse();
            double price = c.getPrice() != null ? c.getPrice() : 0.0;

            String monthStr = e.getEnrolledAt().format(monthFormatter);
            monthlyRevenue.put(monthStr, monthlyRevenue.getOrDefault(monthStr, 0.0) + price);

            String courseTitle = c.getTitle();
            courseRevenue.put(courseTitle, courseRevenue.getOrDefault(courseTitle, 0.0) + price);
        }

        // Only top 5 performing courses for brevity
        List<Map.Entry<String, Double>> topCourses = courseRevenue.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("monthlyTrend", monthlyRevenue);
        result.put("topCourses", topCourses);

        return ResponseEntity.ok(result);
    }
}
