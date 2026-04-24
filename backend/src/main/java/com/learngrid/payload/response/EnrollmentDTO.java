package com.learngrid.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentDTO {
    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private String thumbnailUrl;
    private Double progress;
    private Boolean completed;
    private java.util.Set<Long> completedLessonIds;
}
