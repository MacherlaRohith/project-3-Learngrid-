package com.learngrid.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/code")
public class CodeExecutionController {

    @PostMapping("/execute")
    public ResponseEntity<?> executeCode(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        String language = payload.get("language");
        
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("output", "Error: No code provided to the sandbox."));
        }

        try {
            String output = runInSandbox(code, language);
            return ResponseEntity.ok(Map.of("output", output));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("output", "Runtime Engine Error: " + e.getMessage()));
        }
    }

    private String runInSandbox(String code, String language) throws Exception {
        Path tempFile = null;
        ProcessBuilder pb;
        String fileName = "script_" + UUID.randomUUID().toString();

        if ("javascript".equals(language)) {
            tempFile = Files.createTempFile(fileName, ".js");
            Files.writeString(tempFile, code);
            pb = new ProcessBuilder("node", tempFile.toString());
        } else if ("python".equals(language)) {
            tempFile = Files.createTempFile(fileName, ".py");
            Files.writeString(tempFile, code);
            pb = new ProcessBuilder("python", tempFile.toString());
        } else if ("java".equals(language)) {
            // For simple Java execution (JDK 11+ source file runner)
            Path tempDir = Files.createTempDirectory("java-sandbox");
            tempFile = tempDir.resolve("Main.java");
            Files.writeString(tempFile, code);
            pb = new ProcessBuilder("java", tempFile.toString());
        } else {
            return "Execution Error: Environment for '" + language + "' is not configured.";
        }

        pb.redirectErrorStream(true);
        Process process = pb.start();
        
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        
        process.waitFor();
        if (tempFile != null) {
            Files.deleteIfExists(tempFile);
        }

        return output.length() == 0 ? "(Command executed with no output)" : output.toString();
    }
}
