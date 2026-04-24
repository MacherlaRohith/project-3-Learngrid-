package com.learngrid.controller;

import com.learngrid.model.Course;
import com.learngrid.model.CourseNote;
import com.learngrid.model.User;
import com.learngrid.payload.response.MessageResponse;
import com.learngrid.repository.CourseNoteRepository;
import com.learngrid.repository.CourseRepository;
import com.learngrid.repository.EnrollmentRepository;
import com.learngrid.repository.UserRepository;
import com.learngrid.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/courses/{courseId}/notes")
@Transactional
public class CourseNoteController {

    private static final String UPLOAD_DIR = "./uploads/notes/";

    @Autowired
    private CourseNoteRepository courseNoteRepository;

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

    // Instructor adds a note (text-only OR with PDF upload)
    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addNote(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam(value = "content", required = false, defaultValue = "") String content,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        CourseNote.CourseNoteBuilder builder = CourseNote.builder()
                .title(title)
                .content(content)
                .course(course);

        // Handle PDF upload
        if (file != null && !file.isEmpty()) {
            try {
                String savedPath = saveFile(file, courseId);
                builder.pdfUrl(savedPath);
                builder.originalFileName(file.getOriginalFilename());
            } catch (IOException e) {
                return ResponseEntity.badRequest().body(new MessageResponse("File upload failed: " + e.getMessage()));
            }
        }

        CourseNote note = builder.build();
        courseNoteRepository.save(note);

        return ResponseEntity.ok(toMap(note));
    }

    // Instructor updates a note (can replace or add PDF)
    @PutMapping(value = "/{noteId}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateNote(
            @PathVariable Long courseId,
            @PathVariable Long noteId,
            @RequestParam("title") String title,
            @RequestParam(value = "content", required = false, defaultValue = "") String content,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        CourseNote note = courseNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        note.setTitle(title);
        note.setContent(content);

        if (file != null && !file.isEmpty()) {
            try {
                // Delete old file if exists
                if (note.getPdfUrl() != null) {
                    Files.deleteIfExists(Paths.get("." + note.getPdfUrl()));
                }
                String savedPath = saveFile(file, courseId);
                note.setPdfUrl(savedPath);
                note.setOriginalFileName(file.getOriginalFilename());
            } catch (IOException e) {
                return ResponseEntity.badRequest().body(new MessageResponse("File upload failed: " + e.getMessage()));
            }
        }

        courseNoteRepository.save(note);
        return ResponseEntity.ok(toMap(note));
    }

    // Instructor deletes a note (and its PDF)
    @DeleteMapping("/{noteId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteNote(@PathVariable Long courseId, @PathVariable Long noteId) {
        CourseNote note = courseNoteRepository.findById(noteId).orElse(null);
        if (note != null && note.getPdfUrl() != null) {
            try {
                Files.deleteIfExists(Paths.get("." + note.getPdfUrl()));
            } catch (IOException ignored) {}
        }
        courseNoteRepository.deleteById(noteId);
        return ResponseEntity.ok(new MessageResponse("Note deleted successfully."));
    }

    // Anyone enrolled (or instructor/admin) can READ notes
    @GetMapping
    public ResponseEntity<?> getNotes(@PathVariable Long courseId) {
        User currentUser = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        boolean isInstructorOrAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().name().equals("ROLE_ADMIN") || r.getName().name().equals("ROLE_INSTRUCTOR"));
        boolean isEnrolled = enrollmentRepository.existsByStudentAndCourse(currentUser, course);

        if (!isInstructorOrAdmin && !isEnrolled) {
            return ResponseEntity.status(403).body(new MessageResponse("Access denied. You must be enrolled in this course."));
        }

        List<CourseNote> notes = courseNoteRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
        List<Map<String, Object>> result = notes.stream().map(this::toMap).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // --- Helpers ---

    private String saveFile(MultipartFile file, Long courseId) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR + courseId);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String uniqueName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(uniqueName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        // Return a URL-friendly path the frontend can use
        return "/uploads/notes/" + courseId + "/" + uniqueName;
    }

    private Map<String, Object> toMap(CourseNote n) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", n.getId());
        map.put("title", n.getTitle());
        map.put("content", n.getContent());
        map.put("pdfUrl", n.getPdfUrl());
        map.put("originalFileName", n.getOriginalFileName());
        map.put("createdAt", n.getCreatedAt());
        map.put("updatedAt", n.getUpdatedAt());
        return map;
    }
}
