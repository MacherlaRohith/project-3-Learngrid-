package com.learngrid.controller;

import com.learngrid.model.ERole;
import com.learngrid.model.Role;
import com.learngrid.model.User;
import com.learngrid.payload.request.LoginRequest;
import com.learngrid.payload.request.SignupRequest;
import com.learngrid.payload.request.ForgotPasswordRequest;
import com.learngrid.payload.request.ResetPasswordRequest;
import com.learngrid.payload.response.JwtResponse;
import com.learngrid.payload.response.MessageResponse;
import com.learngrid.repository.RoleRepository;
import com.learngrid.repository.UserRepository;
import com.learngrid.repository.PasswordResetTokenRepository;
import com.learngrid.model.PasswordResetToken;
import com.learngrid.security.JwtUtils;
import com.learngrid.security.UserDetailsImpl;
import com.learngrid.service.EmailService;
import com.learngrid.service.RealtimeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
	@Autowired
	AuthenticationManager authenticationManager;

	@Autowired
	UserRepository userRepository;

	@Autowired
	RoleRepository roleRepository;

	@Autowired
	PasswordEncoder encoder;

	@Autowired
	JwtUtils jwtUtils;

	@Autowired
	PasswordResetTokenRepository passwordResetTokenRepository;

	@Autowired
	EmailService emailService;

	@Autowired
	RealtimeService realtimeService;

	@PostMapping("/login")
	public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
		System.out.println("Processing login attempt for email: " + loginRequest.getEmail());

		    try {
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

      System.out.println("Authentication successful for email: " + loginRequest.getEmail());
      SecurityContextHolder.getContext().setAuthentication(authentication);
      String jwt = jwtUtils.generateJwtToken(authentication);

      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
      List<String> roles = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          .collect(Collectors.toList());

      return ResponseEntity.ok(new JwtResponse(jwt,
          userDetails.getId(),
          userDetails.getUsername(),
          userDetails.getEmail(),
          roles,
          userDetails.isVerified()));
    } catch (org.springframework.security.authentication.LockedException e) {
      System.err.println("Login failure (Locked): " + e.getMessage());
      return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
          .body(new MessageResponse("Error: Your account has been suspended. Please contact support."));
    } catch (Exception e) {
      System.err.println("Login failure for user " + loginRequest.getEmail() + ": " + e.getMessage());
      return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
          .body(new MessageResponse("Error: Bad credentials. Check your email and password. Details: " + e.getMessage()));
    }
	}

	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
		if (userRepository.existsByUsername(signUpRequest.getUsername())) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Error: Username is already taken!"));
		}

		if (userRepository.existsByEmail(signUpRequest.getEmail())) {
			return ResponseEntity
					.badRequest()
					.body(new MessageResponse("Error: Email is already in use!"));
		}

		// Create new user's account
		User user = User.builder()
				.username(signUpRequest.getUsername())
				.email(signUpRequest.getEmail())
				.password(encoder.encode(signUpRequest.getPassword()))
				.roles(new HashSet<>())
				.build();

		Set<String> strRoles = signUpRequest.getRole();
		Set<Role> roles = new HashSet<>();

		if (strRoles == null) {
			Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
					.orElseThrow(() -> new RuntimeException("Error: Role is not found."));
			roles.add(userRole);
		} else {
			strRoles.forEach(role -> {
				switch (role) {
				case "admin":
					// Prevent public registration mapping to ADMIN directly for security
					Role safeRole = roleRepository.findByName(ERole.ROLE_STUDENT)
							.orElseThrow(() -> new RuntimeException("Error: Role is not found."));
					roles.add(safeRole);
					break;
				case "instructor":
					// Assign Student Role, but flag them as pending an Instructor status
					Role pendingRole = roleRepository.findByName(ERole.ROLE_STUDENT)
							.orElseThrow(() -> new RuntimeException("Error: Role is not found."));
					roles.add(pendingRole);
					user.setInstructorApproved(false); // Flag triggers Admin UI queue
					break;
				default:
					Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
							.orElseThrow(() -> new RuntimeException("Error: Role is not found."));
					roles.add(userRole);
				}
			});
		}

		user.setRoles(roles);
		userRepository.save(user);

		realtimeService.notifyAdminDashboard();

		if (user.getInstructorApproved() != null && !user.getInstructorApproved()) {
			return ResponseEntity.ok(new MessageResponse("Instructor registration submitted! Your account is pending admin approval. You can log in as a student until approved."));
		}

		return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
	}

	@GetMapping("/me")
	public ResponseEntity<?> getCurrentUser(Authentication authentication) {
		UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
		List<String> roles = userDetails.getAuthorities().stream()
				.map(item -> item.getAuthority())
				.collect(Collectors.toList());

		return ResponseEntity.ok(new JwtResponse(null, // Token already exists on client
				userDetails.getId(),
				userDetails.getUsername(),
				userDetails.getEmail(),
				roles,
				userDetails.isVerified()));
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new RuntimeException("Error: User not found with email: " + request.getEmail()));

		// Delete existing token if any
		passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

		String token = java.util.UUID.randomUUID().toString();
		PasswordResetToken resetToken = new PasswordResetToken(token, user);
		passwordResetTokenRepository.save(resetToken);

		String resetLink = "http://localhost:4200/reset-password?token=" + token;
		emailService.sendPasswordResetEmail(user.getEmail(), resetLink);

		return ResponseEntity.ok(new MessageResponse("Password reset link has been sent to your email."));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
				.orElseThrow(() -> new RuntimeException("Error: Invalid or expired password reset token."));

		if (resetToken.isExpired()) {
			passwordResetTokenRepository.delete(resetToken);
			return ResponseEntity.badRequest().body(new MessageResponse("Error: Password reset token has expired."));
		}

		User user = resetToken.getUser();
		user.setPassword(encoder.encode(request.getNewPassword()));
		userRepository.save(user);

		passwordResetTokenRepository.delete(resetToken);

		return ResponseEntity.ok(new MessageResponse("Password has been reset successfully."));
	}
}
