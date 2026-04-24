package com.learngrid.repository;

import com.learngrid.model.Warning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarningRepository extends JpaRepository<Warning, Long> {
    List<Warning> findByUserIdOrderByTimestampDesc(Long userId);
}
