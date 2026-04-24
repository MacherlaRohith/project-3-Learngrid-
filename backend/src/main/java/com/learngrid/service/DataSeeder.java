package com.learngrid.service;

import com.learngrid.model.*;
import com.learngrid.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            seedRoles();
        }

        // Force update existing courses with beautiful images
        courseRepository.findAll().forEach(course -> {
            if(course.getTitle().contains("Angular")) {
                course.setThumbnailUrl("https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80");
            } else if (course.getTitle().contains("Spring")) {
                course.setThumbnailUrl("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80");
            } else {
                course.setThumbnailUrl("https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80");
            }
            courseRepository.save(course);
        });

        // Add a premium third course if it doesn't exist
        if (!courseRepository.findAll().stream().anyMatch(c -> c.getTitle().contains("Editorial Scholar"))) {
            User instructor = userRepository.findByUsername("instructor").orElse(userRepository.findAll().get(0));
            Course premiumCourse = Course.builder()
                .title("The Editorial Scholar: Masterclass")
                .description("Advanced narrative structures, design principles, and UI/UX typography. The ultimate light-theme aesthetic.")
                .instructor(instructor)
                .thumbnailUrl("https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80")
                .lessons(new java.util.ArrayList<>())
                .isApproved(true)
                .price(124.0)
                .build();
            courseRepository.save(premiumCourse);
        }

        // Only seed if admin user doesn't exist (first run)
        if (!userRepository.existsByUsername("rohith@admin.com")) {
            seedUsers();
            seedCourses();
        }
    }

    private void seedRoles() {
        roleRepository.save(new Role(null, ERole.ROLE_STUDENT));
        roleRepository.save(new Role(null, ERole.ROLE_INSTRUCTOR));
        roleRepository.save(new Role(null, ERole.ROLE_ADMIN));
    }

    private void seedUsers() {
        Role studentRole = roleRepository.findByName(ERole.ROLE_STUDENT).get();
        Role instructorRole = roleRepository.findByName(ERole.ROLE_INSTRUCTOR).get();
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).get();

        User student = User.builder()
                .username("student")
                .email("student@learngrid.com")
                .password(encoder.encode("password"))
                .roles(new HashSet<>(Collections.singletonList(studentRole)))
                .build();
        userRepository.save(student);

        User instructor = User.builder()
                .username("instructor")
                .email("instructor@learngrid.com")
                .password(encoder.encode("password"))
                .instructorApproved(true)
                .roles(new HashSet<>(Collections.singletonList(instructorRole)))
                .build();
        userRepository.save(instructor);

        // Requested Rohith Users
        User rohithStudent = User.builder()
                .username("rohith@student.com")
                .email("rohith@student.com")
                .password(encoder.encode("password123"))
                .roles(new HashSet<>(Collections.singletonList(studentRole)))
                .build();
        userRepository.save(rohithStudent);

        User rohithInstructor = User.builder()
                .username("rohith@instructor.com")
                .email("rohith@instructor.com")
                .password(encoder.encode("password123"))
                .instructorApproved(true)
                .roles(new HashSet<>(Collections.singletonList(instructorRole)))
                .build();
        userRepository.save(rohithInstructor);

        User rohithAdmin = User.builder()
                .username("rohith@admin.com")
                .email("rohith@admin.com")
                .password(encoder.encode("password123"))
                .roles(new HashSet<>(Collections.singletonList(adminRole)))
                .build();
        userRepository.save(rohithAdmin);

    }

    private void seedCourses() {
        User instructor = userRepository.findByUsername("instructor").get();

        Course course1 = Course.builder()
                .title("Complete Angular Masterclass")
                .description("Learn Angular from scratch to advanced concepts.")
                .instructor(instructor)
                .thumbnailUrl("https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80")
                .lessons(new java.util.ArrayList<>())
                .isApproved(true)
                .build();
        courseRepository.save(course1);

        Lesson lesson1 = Lesson.builder()
                .title("Introduction to Components")
                .content("In this lesson, we cover the basics of Angular components.")
                .videoUrl("https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4")
                .course(course1)
                .build();
        lessonRepository.save(lesson1);

        Lesson lesson2 = Lesson.builder()
                .title("Reactive Forms & Validation")
                .content("Mastering forms in Angular with reactive patterns.")
                .videoUrl("https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4")
                .course(course1)
                .build();
        lessonRepository.save(lesson2);

        Quiz quiz1 = Quiz.builder()
                .question("What decorator is used to define an Angular component?")
                .options("A) @Module, B) @Component, C) @Injectable, D) @Directive")
                .correctAnswer("B) @Component")
                .triggerTimestamp(30)
                .lesson(lesson1)
                .build();
        quizRepository.save(quiz1);

        Quiz quiz2 = Quiz.builder()
                .question("Which module is required for Reactive Forms?")
                .options("A) FormsModule, B) ReactiveFormsModule, C) HttpModule, D) RouterModule")
                .correctAnswer("B) ReactiveFormsModule")
                .triggerTimestamp(60)
                .lesson(lesson2)
                .build();
        quizRepository.save(quiz2);

        User studentUser = userRepository.findByUsername("student").get();
        Enrollment enrollment = Enrollment.builder()
                .student(studentUser)
                .course(course1)
                .progress(0.0)
                .completed(false)
                .build();
        enrollmentRepository.save(enrollment);

        Course course2 = Course.builder()
                .title("Spring Boot Microservices")
                .description("Building scalable cloud applications with Spring and Docker.")
                .instructor(instructor)
                .thumbnailUrl("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80")
                .lessons(new java.util.ArrayList<>())
                .isApproved(true)
                .build();
        courseRepository.save(course2);
    }
}
