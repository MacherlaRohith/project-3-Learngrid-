package com.learngrid.controller;

import com.learngrid.model.Warning;
import com.learngrid.repository.WarningRepository;
import com.learngrid.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private WarningRepository warningRepository;

    @GetMapping("/instructor/warnings")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyWarnings() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = userDetails.getId();
        
        List<Warning> warnings = warningRepository.findByUserIdOrderByTimestampDesc(userId);
        
        // Map to a simpler structure for the frontend if needed, but the Warning object is fine too
        return ResponseEntity.ok(warnings);
    }
}
