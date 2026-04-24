package com.learngrid.controller;

import com.learngrid.model.Course;
import com.learngrid.model.Enrollment;
import com.learngrid.model.User;
import com.learngrid.payload.request.PaymentVerificationRequest;
import com.learngrid.payload.response.MessageResponse;
import com.learngrid.repository.CourseRepository;
import com.learngrid.repository.EnrollmentRepository;
import com.learngrid.repository.UserRepository;
import com.learngrid.security.UserDetailsImpl;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/payment")
@Transactional
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;
    
    @Value("${razorpay.currency}")
    private String currency;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Long> payload) {
        try {
            Long courseId = payload.get("courseId");
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            if (course.getPrice() == null || course.getPrice() <= 0) {
                return ResponseEntity.badRequest().body(new MessageResponse("Course is free, use standard enrollment"));
            }

            // Convert price mathematically to smallest currency unit (Paisa)
            int amount = (int) (course.getPrice() * 100);

            // Simulated Order Generation
            String mockOrderId = "order_mock_" + UUID.randomUUID().toString().substring(0, 10);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", mockOrderId);
            response.put("amount", amount);
            response.put("currency", "INR");
            response.put("keyId", "rzp_simulated_mock_key");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Error creating Razorpay Order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        try {
            User student = getCurrentUser();
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            // Skip cryptographic signature verification for Mock Setup
            if (request.getRazorpayOrderId() == null || request.getRazorpayPaymentId() == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Payment verification failed! Invalid Simulation Tokens."));
            }

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

            return ResponseEntity.ok(new MessageResponse("Payment successful, Enrolled in Premium Course!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Verification error: " + e.getMessage()));
        }
    }
}
