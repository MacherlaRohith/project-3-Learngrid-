package com.learngrid.security;

import com.learngrid.model.ERole;
import com.learngrid.model.Role;
import com.learngrid.model.User;
import com.learngrid.repository.RoleRepository;
import com.learngrid.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        Boolean emailVerified = oAuth2User.getAttribute("email_verified");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            // Register new user via Google
            user = new User();
            user.setEmail(email);
            user.setUsername(email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 5));
            user.setPassword(UUID.randomUUID().toString()); // Random password for OAuth users
            
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
            user.setRoles(roles);
        }

        // Mark as verified if Google says so or if they logged in via Google
        if (emailVerified != null && emailVerified) {
            user.setIsVerified(true);
        } else {
            user.setIsVerified(true); // By default, OAuth users are considered verified
        }

        userRepository.save(user);

        return oAuth2User;
    }
}
