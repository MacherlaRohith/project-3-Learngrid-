package com.learngrid.repository;

import com.learngrid.model.Certificate;
import com.learngrid.model.Enrollment;
import com.learngrid.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, String> {
    Optional<Certificate> findByEnrollment(Enrollment enrollment);
    List<Certificate> findByEnrollmentStudent(User student);
}
