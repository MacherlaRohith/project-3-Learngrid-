package com.learngrid.security;

import com.learngrid.model.User;
import com.learngrid.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
  @Autowired
  UserRepository userRepository;

  @Override
  @Transactional
  public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
    // Attempt Email Lookup First
    User user = userRepository.findByEmailIgnoreCase(usernameOrEmail)
        .orElseGet(() -> userRepository.findByUsername(usernameOrEmail)
        .orElseThrow(() -> new UsernameNotFoundException("User Not Found with identifier: " + usernameOrEmail)));

    return UserDetailsImpl.build(user);
  }
}
