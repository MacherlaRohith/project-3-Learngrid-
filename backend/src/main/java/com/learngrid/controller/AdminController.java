package com.learngrid.controller;

import com.learngrid.model.*;
import com.learngrid.payload.response.MessageResponse;
import com.learngrid.repository.*;
import com.learngrid.service.RealtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.transaction.annotation.Transactional;
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Transactional
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private WarningRepository warningRepository;

    @Autowired
    private RealtimeService realtimeService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        logger.info("Admin Command Center: Fetching platform statistics...");
        Map<String, Object> stats = new HashMap<>();
        
        try {
            long totalUsers = userRepository.count();
            long studentsActive = userRepository.countByRoles_NameAndIsBannedFalse(ERole.ROLE_STUDENT);
            long studentsBanned = userRepository.countByRoles_NameAndIsBannedTrue(ERole.ROLE_STUDENT);
            long instructorsActive = userRepository.countByRoles_NameAndIsBannedFalse(ERole.ROLE_INSTRUCTOR);
            long instructorsBanned = userRepository.countByRoles_NameAndIsBannedTrue(ERole.ROLE_INSTRUCTOR);
            long admins = userRepository.countByRoles_Name(ERole.ROLE_ADMIN);
            long courses = courseRepository.count();
            long enrollments = enrollmentRepository.count();

            stats.put("totalUsers", totalUsers);
            stats.put("studentsCount", studentsActive);
            stats.put("studentsBannedCount", studentsBanned);
            stats.put("instructorsCount", instructorsActive);
            stats.put("instructorsBannedCount", instructorsBanned);
            stats.put("adminsCount", admins);
            stats.put("totalCourses", courses);
            stats.put("totalEnrollments", enrollments);
        } catch (Exception e) {
            logger.error("Admin RC Error: Failed to compute stats", e);
            return ResponseEntity.internalServerError().body(new MessageResponse("Error: Could not retrieve platform statistics."));
        }
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/courses")
    public ResponseEntity<?> getAllCourses() {
        logger.info("Admin Command Center: Initiating global course inventory retrieval...");
        try {
            long count = courseRepository.count();
            if (count == 0) {
                logger.warn("Inventory Alert: No courses found. Triggering emergency data recovery...");
                // Basic emergency seed if repository is empty
                seedEmergencyCourses();
            }
            
            List<Course> courses = courseRepository.findAll();
            logger.info("Database scan complete. Found {} courses to process.", courses.size());
            
            List<Map<String, Object>> courseData = courses.stream().map(course -> {
                logger.debug("Mapping course: ID={}, Title='{}'", course.getId(), course.getTitle());
                Map<String, Object> map = new HashMap<>();
                map.put("id", course.getId());
                map.put("title", course.getTitle());
                
                String instructorName = "Unassigned";
                try {
                    if (course.getInstructor() != null) {
                        instructorName = course.getInstructor().getUsername();
                    }
                } catch (Exception e) {
                    logger.error("Data integrity alert: Course {} has instructor reference but failed to fetch username", course.getId());
                }
                map.put("instructorName", instructorName);
                
                // Use a safe count for enrollments with explicit logging
                long enrollments = 0;
                try {
                    enrollments = enrollmentRepository.countByCourse_Id(course.getId());
                    logger.debug("Course {} enrollment count: {}", course.getId(), enrollments);
                } catch (Exception e) {
                    logger.error("SQL/Mapping failure for course {} enrollment count: {}", course.getId(), e.getMessage());
                }
                map.put("enrollmentCount", enrollments);
                return map;
            }).collect(Collectors.toList());
            
            logger.info("Inventory mapping successful. Dispatching {} course records to frontend.", courseData.size());
            return ResponseEntity.ok(courseData);
        } catch (Exception e) {
            logger.error("CRITICAL: Global course inventory fetch collapsed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(new MessageResponse("Error retrieving course inventory: " + e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> userData = users.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("username", user.getUsername());
            map.put("email", user.getEmail());
            map.put("roles", user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()));
            map.put("isBanned", user.getIsBanned() != null && user.getIsBanned());
            map.put("warningCount", user.getWarningCount() != null ? user.getWarningCount() : 0);
            
            // Stats for Activity
            map.put("coursesCreated", courseRepository.countByInstructor_Id(user.getId()));
            map.put("enrollmentsCount", enrollmentRepository.countByStudent_Id(user.getId()));
            
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(userData);
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<?> toggleUserBan(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsBanned(user.getIsBanned() == null || !user.getIsBanned());
        userRepository.save(user);
        
        realtimeService.notifyAdminDashboard();
        
        String action = user.getIsBanned() ? "restricted" : "restored";
        return ResponseEntity.ok(new MessageResponse("User access successfully " + action + "!"));
    }

    @PostMapping("/users/{userId}/warn")
    public ResponseEntity<?> warnUser(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String reason = payload.getOrDefault("reason", "No reason provided by administrator.");
        
        // Update simple counter
        user.setWarningCount((user.getWarningCount() == null ? 0 : user.getWarningCount()) + 1);
        
        // Create permanent record
        Warning warning = Warning.builder()
                .reason(reason)
                .timestamp(LocalDateTime.now())
                .user(user)
                .build();
        
        warningRepository.save(warning);
        userRepository.save(user);
        
        realtimeService.notifyAdminDashboard();
        realtimeService.notifyInstructorDashboard(userId);
        
        return ResponseEntity.ok(new MessageResponse("Instructor warned with reason. Warning count is now " + user.getWarningCount()));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String newRoleStr = payload.get("role");
        ERole eRole;
        try {
            eRole = ERole.valueOf(newRoleStr);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid role."));
        }

        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Error: Role not found."));

        user.getRoles().clear();
        user.getRoles().add(role);
        
        if (eRole == ERole.ROLE_STUDENT) {
            user.setInstructorApproved(null);
        } else if (eRole == ERole.ROLE_INSTRUCTOR) {
            user.setInstructorApproved(false);
        }

        userRepository.save(user);
        realtimeService.notifyAdminDashboard();
        
        return ResponseEntity.ok(new MessageResponse("User role updated successfully!"));
    }

    @GetMapping("/pending-instructors")
    public ResponseEntity<?> getPendingInstructors() {
        // Find users who registered as instructor (instructorApproved == false)
        // They currently have ROLE_STUDENT until admin approves them
        List<User> pending = userRepository.findByInstructorApprovedFalse();
        
        List<Map<String, Object>> result = pending.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("email", u.getEmail());
            map.put("roles", u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()));
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/courses/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingCourses() {
        List<Course> pending = courseRepository.findByIsApprovedFalse();
        List<Map<String, Object>> mapped = pending.stream().map(pc -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", pc.getId());
            map.put("title", pc.getTitle());
            map.put("price", pc.getPrice());
            map.put("instructorName", pc.getInstructor() != null ? pc.getInstructor().getUsername() : "Unknown");
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(mapped);
    }

    @PostMapping("/courses/{id}/approve")
    public ResponseEntity<?> approveCourse(@PathVariable Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setIsApproved(true);
        courseRepository.save(course);
        
        realtimeService.notifyAdminDashboard();
        if (course.getInstructor() != null) {
            realtimeService.notifyInstructorDashboard(course.getInstructor().getId());
        }
        
        return ResponseEntity.ok(new MessageResponse("Course approved and published!"));
    }

    @PostMapping("/courses/{id}/reject")
    public ResponseEntity<?> rejectCourse(@PathVariable Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        Long instructorId = course.getInstructor() != null ? course.getInstructor().getId() : null;
        courseRepository.delete(course);
        
        realtimeService.notifyAdminDashboard();
        if (instructorId != null) {
            realtimeService.notifyInstructorDashboard(instructorId);
        }
        
        return ResponseEntity.ok(new MessageResponse("Course rejected and removed."));
    }

    @PostMapping("/approve/{userId}")
    public ResponseEntity<?> approveInstructor(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(user.getInstructorApproved() != null && !user.getInstructorApproved()) {
            Role instructorRole = roleRepository.findByName(ERole.ROLE_INSTRUCTOR)
                    .orElseThrow(() -> new RuntimeException("Error: Role not found."));

            user.getRoles().clear(); 
            user.getRoles().add(instructorRole); 
            user.setInstructorApproved(true);
            userRepository.save(user);

            realtimeService.notifyAdminDashboard();
            realtimeService.notifyInstructorDashboard(userId);

            return ResponseEntity.ok(new MessageResponse("Instructor approved securely!"));
        }

        return ResponseEntity.badRequest().body(new MessageResponse("User is not pending approval."));
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<?> rejectInstructor(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setInstructorApproved(null);
        userRepository.save(user);

        realtimeService.notifyAdminDashboard();

        return ResponseEntity.ok(new MessageResponse("Instructor explicitly rejected."));
    }
    private void seedEmergencyCourses() {
        try {
            User instructor = userRepository.findByUsername("instructor")
                    .orElseGet(() -> {
                        Role instructorRole = roleRepository.findByName(ERole.ROLE_INSTRUCTOR).orElse(null);
                        User u = User.builder()
                                .username("instructor")
                                .email("instructor@learngrid.com")
                                .password("$2a$10$8.UnVuG9HHgffUDAlk8UrOuNv5fctjFLcaiYiCGnzBnZyzx0CPVG2") // 'password'
                                .instructorApproved(true)
                                .roles(new java.util.HashSet<>(java.util.Arrays.asList(instructorRole)))
                                .build();
                        return userRepository.save(u);
                    });

            Course course1 = Course.builder()
                    .title("Complete Angular Masterclass")
                    .description("Auto-recovered: Learn Angular from scratch.")
                    .instructor(instructor)
                    .thumbnailUrl("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80")
                    .isApproved(true)
                    .build();
            courseRepository.save(course1);

            Course course2 = Course.builder()
                    .title("Spring Boot Microservices")
                    .description("Auto-recovered: Building scalable cloud applications.")
                    .instructor(instructor)
                    .thumbnailUrl("https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80")
                    .isApproved(true)
                    .build();
            courseRepository.save(course2);
            logger.info("Emergency Recovery: Successfully re-seeded 2 default courses.");
        } catch (Exception e) {
            logger.error("Emergency Recovery Failed: {}", e.getMessage());
        }
    }
}
