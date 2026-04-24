package com.learngrid.controller;

import com.learngrid.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/explain")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> explain(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        String context = payload.getOrDefault("context", "General Education Content");

        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text to explain is required."));
        }

        String result = geminiService.generateExplanation(text, context);
        return ResponseEntity.ok(Map.of("explanation", result));
    }
}
