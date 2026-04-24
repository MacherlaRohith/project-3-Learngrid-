package com.learngrid.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;

@Service
public class GeminiService {

    @Value("${google.gemini.api.key}")
    private String apiKey;

    @Value("${google.gemini.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateExplanation(String text, String context) {
        if ("REPLACE_WITH_YOUR_GEMINI_API_KEY".equals(apiKey)) {
            return "AI Study Buddy: Please configure your API Key in application.properties to see live explanations!";
        }

        String prompt = String.format(
            "You are a professional educational assistant on the Learngrid platform. " +
            "The student is currently learning about: %s. " +
            "They have highlighted this specific part and need an explanation: \"%s\". " +
            "Provide a clear, concise, and helpful explanation. If it's code, explain it line-by-line. " +
            "Format your response with markdown if helpful.",
            context, text
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // Construct Groq (OpenAI-compatible) API Request Body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile");
            
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);
            
            requestBody.put("messages", Collections.singletonList(userMessage));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            System.out.println("Sending AI Request to: " + apiUrl + " (key hidden)");

            // Since apiKey is passed via header now, don't append it to the URL
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> body = mapper.readValue(response.getBody(), Map.class);
                
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    
                    if (message != null) {
                        return (String) message.get("content");
                    }
                }
            }
            return "AI Study Buddy: I received an empty or unexpected response. Please check terminal logs.";
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("AI API Error: " + e.getMessage());
            return "AI Study Buddy: Error communicating with AI service. Details: " + e.getMessage();
        }
    }

    public String generateAssessmentQuestions(String courseTitle, String courseDescription, List<String> lessonTitles) {
        if ("REPLACE_WITH_YOUR_GEMINI_API_KEY".equals(apiKey)) {
            return null;
        }

        String prompt = String.format(
            "Act as an educational content creator for the Learngrid platform. " +
            "Generate a comprehensive final assessment for the course: '%s'.\n" +
            "Course Description: %s\n" +
            "Lesson Topics: %s\n\n" +
            "Requirements:\n" +
            "1. Generate exactly 20 multiple-choice questions.\n" +
            "2. Each question must have 4 options.\n" +
            "3. Format the result as a raw JSON array of objects. Do not include markdown formatting tags like ```json.\n" +
            "4. Each object must have these fields: 'question', 'options' (as a single string where options are separated by semicolons), and 'correctAnswer'.\n\n" +
            "Example JSON element:\n" +
            "{\"question\": \"What is Java?\", \"options\": \"A coffee brand;A programming language;A city;A movie\", \"correctAnswer\": \"A programming language\"}",
            courseTitle, courseDescription, String.join(", ", lessonTitles)
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.1-8b-instant");
            
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);
            
            requestBody.put("messages", Collections.singletonList(userMessage));
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            System.out.println("AI ASSESSMENT API STATUS: " + response.getStatusCode());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> body = mapper.readValue(response.getBody(), Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                
                if (choices != null && !choices.isEmpty()) {
                    return (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("AI Assessment Error: " + e.getMessage());
            return null;
        }
    }
}
