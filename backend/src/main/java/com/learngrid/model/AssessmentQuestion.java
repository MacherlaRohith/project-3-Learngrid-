package com.learngrid.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "assessment_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long courseId;

    @Column(columnDefinition = "TEXT")
    private String question;
    
    @Column(columnDefinition = "TEXT")
    private String options; // Semicolon separated options
    
    private String correctAnswer;
}
