package com.learngrid.controller;

import com.learngrid.model.Course;
import com.learngrid.model.Enrollment;
import com.learngrid.model.Lesson;
import com.learngrid.model.User;
import com.learngrid.payload.response.MessageResponse;
import com.learngrid.repository.CourseRepository;
import com.learngrid.repository.EnrollmentRepository;
import com.learngrid.repository.LessonRepository;
import com.learngrid.repository.UserRepository;
import com.learngrid.repository.CertificateRepository;
import com.learngrid.model.Certificate;
import com.learngrid.security.UserDetailsImpl;
import com.learngrid.service.RealtimeService;
import com.learngrid.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.learngrid.payload.response.CourseStatsDTO;
import com.learngrid.payload.response.EnrollmentDTO;

import org.springframework.transaction.annotation.Transactional;
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/courses")
@Transactional
public class CourseController {
    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private RealtimeService realtimeService;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findByIsApprovedTrue();
    }

    @GetMapping("/my-courses")
    @PreAuthorize("hasRole('STUDENT')")
    public List<Course> getMyEnrolledCourses() {
        User student = getCurrentUser();
        return enrollmentRepository.findByStudent(student).stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
    }

    @GetMapping("/my-enrollments")
    @PreAuthorize("hasRole('STUDENT')")
    public List<EnrollmentDTO> getMyEnrollments() {
        User student = getCurrentUser();
        return enrollmentRepository.findByStudent(student).stream()
                .map(enrollment -> EnrollmentDTO.builder()
                        .id(enrollment.getId())
                        .courseId(enrollment.getCourse().getId())
                        .title(enrollment.getCourse().getTitle())
                        .description(enrollment.getCourse().getDescription())
                        .thumbnailUrl(enrollment.getCourse().getThumbnailUrl())
                        .progress(enrollment.getProgress())
                        .completed(enrollment.getCompleted())
                        .completedLessonIds(enrollment.getCompletedLessonIds())
                        .build())
                .collect(Collectors.toList());
    }

    @GetMapping("/created-courses")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public List<Course> getInstructorCourses() {
        User instructor = getCurrentUser();
        return courseRepository.findByInstructor(instructor);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCourseById(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(course -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", course.getId());
                    map.put("title", course.getTitle());
                    map.put("description", course.getDescription());
                    map.put("thumbnailUrl", course.getThumbnailUrl());
                    map.put("price", course.getPrice());
                    map.put("isApproved", course.getIsApproved());
                    
                    if (course.getInstructor() != null) {
                        map.put("instructorName", course.getInstructor().getUsername());
                    }
                    
                    // Map lessons explicitly to avoid circular dependencies
                    List<Map<String, Object>> lessonMaps = course.getLessons().stream().map(l -> {
                        Map<String, Object> lMap = new HashMap<>();
                        lMap.put("id", l.getId());
                        lMap.put("title", l.getTitle());
                        lMap.put("content", l.getContent());
                        lMap.put("videoUrl", l.getVideoUrl());
                        return lMap;
                    }).collect(Collectors.toList());
                    map.put("lessons", lessonMaps);
                    
                    return ResponseEntity.ok(map);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public Course createCourse(@RequestBody Course course) {
        course.setInstructor(getCurrentUser());
        course.setIsApproved(false);
        Course saved = courseRepository.save(course);
        
        realtimeService.notifyAdminDashboard();
        realtimeService.notifyInstructorDashboard(saved.getInstructor().getId());
        
        return saved;
    }

    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> enrollInCourse(@PathVariable Long courseId) {
        User student = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Already enrolled in this course"));
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .enrolledAt(LocalDateTime.now())
                .progress(0.0)
                .completed(false)
                .build();

        enrollmentRepository.save(enrollment);
        return ResponseEntity.ok(new MessageResponse("Enrolled successfully!"));
    }

    @PostMapping("/{courseId}/complete-lesson/{lessonId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> completeLesson(@PathVariable Long courseId, @PathVariable Long lessonId) {
        User student = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Enrollment enrollment = enrollmentRepository.findByStudent(student).stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Not enrolled in this course"));

        // Add the lesson to the completed set
        enrollment.getCompletedLessonIds().add(lessonId);

        // Recalculate progress: (Completed Lessons / Total Lessons) * 100
        int totalLessons = course.getLessons() != null ? course.getLessons().size() : 0;
        if (totalLessons > 0) {
            double progress = ((double) enrollment.getCompletedLessonIds().size() / totalLessons) * 100;
            // Cap at 100
            if (progress > 100.0) progress = 100.0;
            enrollment.setProgress(progress);
            if (progress >= 100.0) {
                enrollment.setCompleted(true);
                // Generate Official Certificate Hash if not exists
                if (certificateRepository.findByEnrollment(enrollment).isEmpty()) {
                    Certificate cert = Certificate.builder()
                            .id(java.util.UUID.randomUUID().toString())
                            .enrollment(enrollment)
                            .issuedAt(LocalDateTime.now())
                            .build();
                    certificateRepository.save(cert);
                }
            }
        }

        enrollmentRepository.save(enrollment);
        return ResponseEntity.ok(new MessageResponse("Lesson marked complete and progress updated"));
    }

    @GetMapping("/{courseId}/enrollment-status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentDTO> getEnrollmentStatus(@PathVariable Long courseId) {
        User student = getCurrentUser();
        return enrollmentRepository.findByStudent(student).stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst()
                .map(e -> ResponseEntity.ok(EnrollmentDTO.builder()
                        .id(e.getId())
                        .courseId(e.getCourse().getId())
                        .progress(e.getProgress())
                        .completed(e.getCompleted())
                        .completedLessonIds(e.getCompletedLessonIds())
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/upload-url")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getUploadUrl(@RequestParam String fileName) {
        String uploadUrl = s3Service.generatePresignedUrl(fileName);
        return ResponseEntity.ok(Map.of("url", uploadUrl));
    }

    @GetMapping("/{courseId}/stats")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<CourseStatsDTO> getCourseStats(@PathVariable Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        long totalEnrollments = enrollmentRepository.countByCourse_Id(courseId);
        long completedCount = enrollmentRepository.countByCourse_IdAndCompleted(courseId, true);
        
        double completionRate = totalEnrollments > 0 ? (double) completedCount / totalEnrollments * 100 : 0;
        double totalRevenue = totalEnrollments * (course.getPrice() != null ? course.getPrice() : 0.0);
        
        // Finalize 7 day trend
        List<Map<String, Object>> trend = new ArrayList<>();
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Enrollment> recentEnrollments = enrollmentRepository.findByCourseIdAndEnrolledAtAfter(courseId, sevenDaysAgo);
        
        // Group by day for the last 7 days
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            long count = recentEnrollments.stream()
                    .filter(e -> e.getEnrolledAt().toLocalDate().isEqual(date))
                    .count();
            
            Map<String, Object> dayStat = new HashMap<>();
            dayStat.put("date", date.toString());
            dayStat.put("count", count);
            trend.add(dayStat);
        }

        return ResponseEntity.ok(CourseStatsDTO.builder()
                .totalEnrollments(totalEnrollments)
                .completionRate(completionRate)
                .totalRevenue(totalRevenue)
                .enrollmentTrend(trend)
                .build());
    }

    @PostMapping("/{courseId}/lessons")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addLesson(@PathVariable Long courseId, @RequestBody Lesson lesson) {
        return courseRepository.findById(courseId).map(course -> {
            lesson.setCourse(course);
            lessonRepository.save(lesson);
            return ResponseEntity.ok(new MessageResponse("Lesson added successfully!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        return courseRepository.findById(id).map(course -> {
            course.setTitle(courseDetails.getTitle());
            course.setDescription(courseDetails.getDescription());
            course.setThumbnailUrl(courseDetails.getThumbnailUrl());
            course.setPrice(courseDetails.getPrice());
            
            Course updated = courseRepository.save(course);
            if (updated.getInstructor() != null) {
                realtimeService.notifyInstructorDashboard(updated.getInstructor().getId());
            }
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        return courseRepository.findById(id).map(course -> {
            Long instructorId = course.getInstructor() != null ? course.getInstructor().getId() : null;
            courseRepository.delete(course);
            
            realtimeService.notifyAdminDashboard();
            if (instructorId != null) {
                realtimeService.notifyInstructorDashboard(instructorId);
            }
            
            return ResponseEntity.ok(new MessageResponse("Course deleted successfully!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/lessons")
    public ResponseEntity<List<Lesson>> getLessonsByCourseId(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(course -> ResponseEntity.ok(course.getLessons()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<Lesson> getLessonById(@PathVariable Long lessonId) {
        return lessonRepository.findById(lessonId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
