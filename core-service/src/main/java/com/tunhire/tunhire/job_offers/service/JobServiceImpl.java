package com.tunhire.tunhire.job_offers.service;
import com.tunhire.tunhire.common.ResourceNotFoundException;
import com.tunhire.tunhire.companies.entity.Company;
import com.tunhire.tunhire.companies.repository.CompanyRepository;
import com.tunhire.tunhire.job_offers.JobRequest;
import com.tunhire.tunhire.job_offers.JobResponse;
import com.tunhire.tunhire.job_offers.JobService;
import com.tunhire.tunhire.job_offers.entity.Job;
import com.tunhire.tunhire.job_offers.entity.JobStatus;
import com.tunhire.tunhire.job_offers.entity.WorkMode;
import com.tunhire.tunhire.job_offers.repository.JobRepository;
import com.tunhire.tunhire.companies.service.MembershipService;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final MembershipService membershipService;

    public JobServiceImpl(
        JobRepository jobRepository,
        CompanyRepository companyRepository,
        MembershipService membershipService
    ) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
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
        job.setWorkMode(request.workMode());
        job.setSalaryMin(request.salaryMin());
        job.setSalaryMax(request.salaryMax());
        job.setStatus(JobStatus.DRAFT);

        return toResponse(jobRepository.save(job));
    }

    @Override
    public Page<JobResponse> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobPage = jobRepository.findByStatus(JobStatus.OPEN, pageable);
        Map<Long, Company> companies = loadCompanies(
            jobPage.map(Job::getCompanyId).toSet()
        );
        return jobPage.map(job -> toResponse(job, companies.get(job.getCompanyId())));
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
        job.setWorkMode(request.workMode());
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

    private Map<Long, Company> loadCompanies(Set<Long> companyIds) {
        if (companyIds == null || companyIds.isEmpty()) {
            return Map.of();
        }
        return companyRepository
            .findAllById(companyIds)
            .stream()
            .collect(Collectors.toMap(Company::getId, company -> company));
    }

    private JobResponse toResponse(Job job) {
        Company company = companyRepository.findById(job.getCompanyId()).orElse(null);
        return toResponse(job, company);
    }

    private JobResponse toResponse(Job job, Company company) {
        return new JobResponse(
            job.getId(),
            job.getTitle(),
            job.getCompanyId(),
            company != null ? company.getName() : "",
            company != null ? company.getSlug() : null,
            company != null ? company.getLogoUrl() : null,
            company != null ? company.getLocation() : null,
            company != null ? company.getDescription() : null,
            company != null ? company.getWebsite() : null,
            job.getLocation(),
            job.getDescription(),
            job.getContractType(),
            job.getExperienceLevel(),
            job.getWorkMode() != null ? job.getWorkMode() : WorkMode.ON_SITE,
            job.getSalaryMin(),
            job.getSalaryMax(),
            job.getStatus(),
            job.getCreatedAt(),
            job.getUpdatedAt()
        );
    }
}
