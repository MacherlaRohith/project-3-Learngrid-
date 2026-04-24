package com.learngrid.controller;

import com.learngrid.model.Lesson;
import com.learngrid.model.Quiz;
import com.learngrid.repository.LessonRepository;
import com.learngrid.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class QuizController {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizRepository quizRepository;

    @GetMapping("/lessons/{lessonId}/quizzes")
    public ResponseEntity<List<Quiz>> getQuizzesByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(quizRepository.findByLessonId(lessonId));
    }

    @PostMapping("/lessons/{lessonId}/quizzes")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Quiz> addQuizToLesson(@PathVariable Long lessonId, @RequestBody Quiz quiz) {
        return lessonRepository.findById(lessonId).map(lesson -> {
            quiz.setLesson(lesson);
            Quiz savedQuiz = quizRepository.save(quiz);
            return ResponseEntity.ok(savedQuiz);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/quizzes/{quizId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitQuiz(@PathVariable Long quizId, @RequestBody Map<String, String> payload) {
        String answer = payload.get("answer");
        return quizRepository.findById(quizId).map(quiz -> {
            boolean isCorrect = quiz.getCorrectAnswer().equalsIgnoreCase(answer);
            return ResponseEntity.ok(Map.of("correct", isCorrect, "correctAnswer", quiz.getCorrectAnswer()));
        }).orElse(ResponseEntity.notFound().build());
    }
}
