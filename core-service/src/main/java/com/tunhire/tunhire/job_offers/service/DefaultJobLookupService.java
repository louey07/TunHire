package com.tunhire.tunhire.job_offers.service;

import com.tunhire.tunhire.applications.JobLookupService;
import com.tunhire.tunhire.job_offers.entity.Job;
import com.tunhire.tunhire.job_offers.repository.JobRepository;
import com.tunhire.tunhire.companies.service.MembershipService;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DefaultJobLookupService implements JobLookupService {

    private final JobRepository jobRepository;
    private final MembershipService membershipService;

    public DefaultJobLookupService(JobRepository jobRepository, MembershipService membershipService) {
        this.jobRepository = jobRepository;
        this.membershipService = membershipService;
    }

    @Override
    public List<Long> getJobIdsByCompanyId(Long companyId) {
        return jobRepository
            .findByCompanyId(companyId)
            .stream()
            .map(Job::getId)
            .collect(Collectors.toList());
    }

    @Override
    public boolean isRecruiterAuthorizedForJob(Long jobId, Long recruiterId) {
        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null) return false;
        return membershipService.isMember(job.getCompanyId(), recruiterId);
    }
}

