package com.tunhire.tunhire.applications.repository;

import com.tunhire.tunhire.applications.entity.ApplicationMatchScore;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationMatchScoreRepository
    extends JpaRepository<ApplicationMatchScore, Long> {

    List<ApplicationMatchScore> findByJobId(Long jobId);
}
