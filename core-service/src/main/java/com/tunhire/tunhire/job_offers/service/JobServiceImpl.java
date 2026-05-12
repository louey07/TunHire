package com.tunhire.tunhire.job_offers.service;
import com.tunhire.tunhire.common.ResourceNotFoundException;
import com.tunhire.tunhire.job_offers.JobRequest;
import com.tunhire.tunhire.job_offers.JobResponse;
import com.tunhire.tunhire.job_offers.JobService;
import com.tunhire.tunhire.job_offers.entity.Job;
import com.tunhire.tunhire.job_offers.entity.JobStatus;
import com.tunhire.tunhire.job_offers.repository.JobRepository;
import com.tunhire.tunhire.companies.service.MembershipService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    
    private final MembershipService membershipService;

    public JobServiceImpl(
        JobRepository jobRepository,
        MembershipService membershipService
    ) {
        this.jobRepository = jobRepository;
        this.membershipService = membershipService;
    }

    @Override
    public JobResponse create(JobRequest request, Long recruiterId) {
        if (!membershipService.isMember(request.companyId(), recruiterId)) {
            throw new IllegalArgumentException("You are not a member of this company");
        }

        Job job = new Job();
        job.setTitle(request.title());
        job.setCompanyId(request.companyId());
        job.setLocation(request.location());
        job.setDescription(request.description());
        job.setContractType(request.contractType());
        job.setExperienceLevel(request.experienceLevel());
        job.setSalaryMin(request.salaryMin());
        job.setSalaryMax(request.salaryMax());
        job.setStatus(JobStatus.DRAFT);

        return toResponse(jobRepository.save(job));
    }

    @Override
    public Page<JobResponse> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return jobRepository
            .findByStatus(JobStatus.OPEN, pageable)
            .map(this::toResponse);
    }

    @Override
    public JobResponse getById(Long id) {
        Job job = jobRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        return toResponse(job);
    }

    @Override
    public JobResponse update(Long id, JobRequest request, Long recruiterId) {
        Job job = jobRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!membershipService.isMember(job.getCompanyId(), recruiterId)) {
            throw new IllegalArgumentException(
                "You do not have permission to update this job"
            );
        }

        job.setTitle(request.title());
        job.setCompanyId(request.companyId());
        job.setLocation(request.location());
        job.setDescription(request.description());
        job.setContractType(request.contractType());
        job.setExperienceLevel(request.experienceLevel());
        job.setSalaryMin(request.salaryMin());
        job.setSalaryMax(request.salaryMax());

        return toResponse(jobRepository.save(job));
    }

    @Override
    public JobResponse updateStatus(Long id, JobStatus status, Long recruiterId) {
        Job job = jobRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!membershipService.isMember(job.getCompanyId(), recruiterId)) {
            throw new IllegalArgumentException(
                "You do not have permission to update this job status"
            );
        }

        job.setStatus(status);
        return toResponse(jobRepository.save(job));
    }

    @Override
    public void delete(Long id, Long recruiterId) {
        Job job = jobRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!membershipService.isMember(job.getCompanyId(), recruiterId)) {
            throw new IllegalArgumentException(
                "You do not have permission to delete this job"
            );
        }

        jobRepository.delete(job);
    }

    private JobResponse toResponse(Job job) {
        return new JobResponse(
            job.getId(),
            job.getTitle(),
            job.getCompanyId(),
            "",
            job.getLocation(),
            job.getDescription(),
            job.getContractType(),
            job.getExperienceLevel(),
            job.getSalaryMin(),
            job.getSalaryMax(),
            job.getStatus(),
            job.getCreatedAt(),
            job.getUpdatedAt()
        );
    }
}

