package com.learngrid.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseStatsDTO {
    private Long totalEnrollments;
    private Double completionRate;
    private Double totalRevenue;
    private List<Map<String, Object>> enrollmentTrend; // [{date: "2024-04-01", count: 5}, ...]
}
