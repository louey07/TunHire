package com.tunhire.tunhire.job_offers.service;

import com.tunhire.tunhire.companies.JobSummaryDto;
import com.tunhire.tunhire.companies.JobSummaryProvider;
import com.tunhire.tunhire.job_offers.entity.Job;
import com.tunhire.tunhire.job_offers.repository.JobRepository;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DefaultJobSummaryProvider implements JobSummaryProvider {

    private final JobRepository jobRepository;

    public DefaultJobSummaryProvider(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @Override
    public List<JobSummaryDto> getJobsByCompanyId(Long companyId) {
        return jobRepository
            .findByCompanyId(companyId)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    private JobSummaryDto toDto(Job job) {
        return new JobSummaryDto(
            job.getId(),
            job.getTitle(),
            job.getLocation(),
            job.getStatus() != null ? job.getStatus().name() : null
        );
    }
}

