package com.learngrid.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learngrid.model.*;
import com.learngrid.repository.*;
import com.learngrid.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentQuestionRepository questionRepository;

    @Autowired
    private AssessmentScoreRepository scoreRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeminiService aiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/{courseId}/generate")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> generateAssessment(@PathVariable Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<String> lessonTitles = course.getLessons().stream()
                .map(Lesson::getTitle)
                .collect(Collectors.toList());

        String aiResponse = aiService.generateAssessmentQuestions(
                course.getTitle(),
                course.getDescription(),
                lessonTitles
        );

        if (aiResponse == null) {
            System.err.println("AI ASSESSMENT ERROR: GeminiService returned null.");
            return ResponseEntity.badRequest().body("AI failed to generate questions. Please ensure API Key is valid.");
        }

        System.out.println("AI ASSESSMENT RAW RESPONSE: \n" + aiResponse);

        // Robust JSON Extraction: Find first '[' and last ']'
        String cleanedJson = "";
        try {
            int startIdx = aiResponse.indexOf("[");
            int endIdx = aiResponse.lastIndexOf("]");
            if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
                cleanedJson = aiResponse.substring(startIdx, endIdx + 1);
            } else {
                cleanedJson = aiResponse.trim();
            }
        } catch (Exception e) {
            System.err.println("JSON EXTRACTION ERROR: " + e.getMessage());
            cleanedJson = aiResponse.trim();
        }

        System.out.println("AI ASSESSMENT CLEANED JSON: \n" + cleanedJson);

        try {
            List<Map<String, String>> questionsData = objectMapper.readValue(cleanedJson, new TypeReference<List<Map<String, String>>>() {});
            
            if (questionsData == null || questionsData.isEmpty()) {
                System.err.println("AI ASSESSMENT ERROR: Parsed questions list is empty.");
                return ResponseEntity.internalServerError().body("AI generated an empty question pool. Please try again.");
            }

            // Delete old pool
            questionRepository.deleteByCourseId(courseId);

            List<AssessmentQuestion> pool = questionsData.stream().map(data -> 
                AssessmentQuestion.builder()
                        .courseId(courseId)
                        .question(data.get("question"))
                        .options(data.get("options"))
                        .correctAnswer(data.get("correctAnswer"))
                        .build()
            ).collect(Collectors.toList());

            questionRepository.saveAll(pool);
            System.out.println("AI ASSESSMENT SUCCESS: Saved " + pool.size() + " questions.");

            return ResponseEntity.ok("Successfully generated " + pool.size() + " assessment questions via AI.");
        } catch (Exception e) {
            System.err.println("AI ASSESSMENT PARSING ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error parsing AI response: " + e.getMessage());
        }
    }

    @GetMapping("/{courseId}/take")
    public ResponseEntity<List<AssessmentQuestion>> getAssessment(@PathVariable Long courseId) {
        List<AssessmentQuestion> pool = questionRepository.findByCourseId(courseId);
        if (pool.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Return 10-15 random questions from pool
        Collections.shuffle(pool);
        int limit = Math.min(pool.size(), 12); // Default to 12 questions
        return ResponseEntity.ok(pool.subList(0, limit));
    }

    @PostMapping("/{courseId}/submit")
    public ResponseEntity<?> submitAssessment(@PathVariable Long courseId, @RequestBody List<Map<String, String>> answers, Authentication authentication) {
        User user = (userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        int correctCount = 0;
        for (Map<String, String> answer : answers) {
            Long qId = Long.parseLong(answer.get("id"));
            String studentAnswer = answer.get("answer");

            AssessmentQuestion question = questionRepository.findById(qId)
                    .orElse(null);

            if (question != null && question.getCorrectAnswer().equalsIgnoreCase(studentAnswer)) {
                correctCount++;
            }
        }

        AssessmentScore score = AssessmentScore.builder()
                .userId(user.getId())
                .courseId(courseId)
                .score(correctCount)
                .totalQuestions(answers.size())
                .build();

        // Update or Save score
        Optional<AssessmentScore> existing = scoreRepository.findByUserIdAndCourseId(user.getId(), courseId);
        if (existing.isPresent()) {
            AssessmentScore current = existing.get();
            if (score.getScore() > current.getScore()) {
                current.setScore(score.getScore());
                current.setTotalQuestions(score.getTotalQuestions());
                scoreRepository.save(current);
            }
            return ResponseEntity.ok(current);
        } else {
            scoreRepository.save(score);
            return ResponseEntity.ok(score);
        }
    }

    @GetMapping("/my-scores")
    public ResponseEntity<List<AssessmentScore>> getMyScores(Authentication authentication) {
        User user = (userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(scoreRepository.findByUserId(user.getId()));
    }
}
