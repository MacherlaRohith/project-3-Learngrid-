package com.learngrid.repository;

import com.learngrid.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUsername(String username);
  Optional<User> findByEmail(String email);
  Optional<User> findByEmailIgnoreCase(String email);
  Boolean existsByUsername(String username);
  Boolean existsByEmail(String email);
  java.util.List<User> findByInstructorApprovedFalse();
  long countByRoles_Name(com.learngrid.model.ERole name);
  long countByRoles_NameAndIsBannedFalse(com.learngrid.model.ERole name);
  long countByRoles_NameAndIsBannedTrue(com.learngrid.model.ERole name);
}
