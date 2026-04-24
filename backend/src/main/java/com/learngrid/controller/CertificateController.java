package com.learngrid.controller;

import com.learngrid.model.Certificate;
import com.learngrid.model.Course;
import com.learngrid.model.User;
import com.learngrid.repository.CertificateRepository;
import com.learngrid.repository.CourseRepository;
import com.learngrid.repository.UserRepository;
import com.learngrid.security.UserDetailsImpl;
import com.learngrid.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/certificates")
@Transactional
public class CertificateController {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/download/{uuid}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable String uuid) {
        try {
            Certificate cert = certificateRepository.findById(uuid)
                    .orElseThrow(() -> new RuntimeException("Certificate not found"));

            byte[] pdfBytes = certificateService.generateCertificatePdf(cert);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("filename", "Learngrid_Certificate_" + cert.getEnrollment().getCourse().getTitle().replaceAll(" ", "_") + ".pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/verify/{uuid}")
    public ResponseEntity<?> verifyCertificate(@PathVariable String uuid) {
        return certificateRepository.findById(uuid).map(cert -> {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("studentName", cert.getEnrollment().getStudent().getUsername());
            response.put("courseName", cert.getEnrollment().getCourse().getTitle());
            response.put("instructorName", cert.getEnrollment().getCourse().getInstructor().getUsername());
            response.put("issuedAt", cert.getIssuedAt().toString());
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("valid", false, "message", "Certificate not found or invalid")));
    }

    @GetMapping("/my-certificates")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getMyCertificates() {
        User student = getCurrentUser();
        List<Map<String, Object>> certs = certificateRepository.findByEnrollmentStudent(student).stream()
                .map(cert -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", cert.getId());
                    map.put("courseTitle", cert.getEnrollment().getCourse().getTitle());
                    map.put("issuedAt", cert.getIssuedAt());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(certs);
    }
    
    @GetMapping("/instructor/course/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getCertificatesForInstructorCourse(@PathVariable Long courseId) {
        User instructor = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
                
        if (!course.getInstructor().getId().equals(instructor.getId()) && !instructor.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Find certificates attached to enrollments of this course
        // Fetch all certs, filter by courseId
        List<Map<String, Object>> certs = certificateRepository.findAll().stream()
                .filter(c -> c.getEnrollment().getCourse().getId().equals(courseId))
                .map(cert -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", cert.getId());
                    map.put("studentName", cert.getEnrollment().getStudent().getUsername());
                    map.put("issuedAt", cert.getIssuedAt());
                    return map;
                })
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(certs);
    }
}
