package com.tunhire.tunhire.job_offers.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tunhire.tunhire.job_offers.entity.Job;
import com.tunhire.tunhire.job_offers.entity.JobStatus;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(JobStatus status);
    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    List<Job> findByCompanyId(Long companyId);
}

