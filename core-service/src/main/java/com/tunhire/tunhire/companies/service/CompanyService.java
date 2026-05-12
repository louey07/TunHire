package com.tunhire.tunhire.companies.service;

import com.tunhire.tunhire.common.ResourceNotFoundException;
import com.tunhire.tunhire.common.CompanyCreatedEvent;
import com.tunhire.tunhire.companies.CompanyCreateRequest;
import com.tunhire.tunhire.companies.CompanyResponse;
import com.tunhire.tunhire.companies.CompanyUpdateRequest;
import com.tunhire.tunhire.companies.entity.Company;
import com.tunhire.tunhire.companies.repository.CompanyRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final MembershipService membershipService;
    private final ApplicationEventPublisher events;

    public CompanyService(CompanyRepository companyRepository, MembershipService membershipService, ApplicationEventPublisher events) {
        this.companyRepository = companyRepository;
        this.membershipService = membershipService;
        this.events = events;
    }

    public CompanyResponse create(CompanyCreateRequest request, Long currentUserId) {
        String slug = request.name().toLowerCase()
            .replaceAll("[^a-z0-9]", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");

        Company company = new Company();
        company.setName(request.name());
        company.setSlug(slug);
        company.setDescription(request.description());
        company.setLogoUrl(request.logoUrl());
        company.setWebsite(request.website());
        company.setLocation(request.location());
        Company savedCompany = companyRepository.save(company);
        
        // Add the creator as the OWNER asynchronously
        events.publishEvent(new CompanyCreatedEvent(savedCompany.getId(), currentUserId));

        return toResponse(savedCompany);
    }

    public CompanyResponse getById(Long id) {
        return toResponse(getEntityById(id));
    }

    public CompanyResponse getBySlug(String slug) {
        Company company = companyRepository
            .findBySlug(slug)
            .orElseThrow(() ->
                new ResourceNotFoundException("Company not found")
            );
        return toResponse(company);
    }

    public CompanyResponse update(Long id, CompanyUpdateRequest request, Long currentUserId) {
        if (!membershipService.isRecruiterAdmin(id, currentUserId)) {
            throw new IllegalArgumentException("You do not have permission to update this company");
        }
        
        Company company = getEntityById(id);
        if (request.name() != null) {
            company.setName(request.name());
        }
        if (request.description() != null) {
            company.setDescription(request.description());
        }
        if (request.logoUrl() != null) {
            company.setLogoUrl(request.logoUrl());
        }
        if (request.website() != null) {
            company.setWebsite(request.website());
        }
        if (request.location() != null) {
            company.setLocation(request.location());
        }
        return toResponse(companyRepository.save(company));
    }

    private Company getEntityById(Long id) {
        return companyRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException("Company not found")
            );
    }

    private CompanyResponse toResponse(Company company) {
        return new CompanyResponse(
            company.getId(),
            company.getName(),
            company.getSlug(),
            company.getDescription(),
            company.getLogoUrl(),
            company.getWebsite(),
            company.getLocation()
        );
    }
}

