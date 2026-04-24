package com.learngrid.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    private LocalDateTime enrolledAt;

    private Double progress; // Progress percentage (0.0 to 100.0)

    private Boolean completed;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "enrollment_completed_lessons", joinColumns = @JoinColumn(name = "enrollment_id"))
    @Column(name = "lesson_id")
    @Builder.Default
    private Set<Long> completedLessonIds = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        enrolledAt = LocalDateTime.now();
        if (progress == null) progress = 0.0;
        if (completed == null) completed = false;
    }
}
