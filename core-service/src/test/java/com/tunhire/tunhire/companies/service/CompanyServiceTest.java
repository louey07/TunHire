package com.tunhire.tunhire.companies.service;

import com.tunhire.tunhire.companies.CompanyCreateRequest;
import com.tunhire.tunhire.companies.CompanyResponse;
import com.tunhire.tunhire.companies.entity.Company;
import com.tunhire.tunhire.companies.repository.CompanyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {
	@Mock
	private CompanyRepository companyRepository;

	@Mock
	private MembershipService membershipService;

@Mock
    private ApplicationEventPublisher events;

    @InjectMocks
	private CompanyService companyService;

	@Test
	void createAndFetchBySlug() {
		Company saved = new Company();
		saved.setId(1L);
		saved.setName("Acme");
		saved.setSlug("acme");

		when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> {
			Company company = invocation.getArgument(0);
			company.setId(1L);
			return company;
		});
		when(companyRepository.findBySlug("acme")).thenReturn(Optional.of(saved));

		CompanyResponse created = companyService.create(new CompanyCreateRequest(
				"Acme",
				"acme",
				null,
				null,
				null,
				null
		), 1L);

		CompanyResponse fetched = companyService.getBySlug("acme");
		assertThat(fetched.id()).isEqualTo(created.id());
	}
}

