package com.tunhire.tunhire.companies.service;

import com.tunhire.tunhire.companies.AcceptInviteRequest;
import com.tunhire.tunhire.companies.CompanyMembershipSummary;
import com.tunhire.tunhire.companies.MemberRole;
import com.tunhire.tunhire.companies.entity.Company;
import com.tunhire.tunhire.companies.entity.CompanyInvitation;
import com.tunhire.tunhire.companies.entity.CompanyMembership;
import com.tunhire.tunhire.companies.repository.CompanyInvitationRepository;
import com.tunhire.tunhire.companies.repository.CompanyMembershipRepository;
import com.tunhire.tunhire.companies.repository.CompanyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MembershipServiceImplTest {

    @Mock
    private CompanyMembershipRepository membershipRepository;

    @Mock
    private CompanyInvitationRepository invitationRepository;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private MembershipServiceImpl membershipService;

    @Test
    void getCompaniesForUserReturnsSummaries() {
        CompanyMembership membership = CompanyMembership.builder()
            .id(1L)
            .companyId(10L)
            .userId(5L)
            .role(MemberRole.RECRUITER_ADMIN)
            .joinedAt(LocalDateTime.now())
            .build();
        Company company = new Company();
        company.setId(10L);
        company.setName("Acme");
        company.setSlug("acme");
        company.setLocation("Tunis");

        when(membershipRepository.findByUserId(5L)).thenReturn(List.of(membership));
        when(companyRepository.findById(10L)).thenReturn(Optional.of(company));

        List<CompanyMembershipSummary> result = membershipService.getCompaniesForUser(5L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).companyName()).isEqualTo("Acme");
        assertThat(result.get(0).role()).isEqualTo(MemberRole.RECRUITER_ADMIN);
    }

    @Test
    void acceptInviteReturnsExistingMembershipWhenAlreadyMember() {
        CompanyInvitation invite = CompanyInvitation.builder()
            .token("abc")
            .companyId(10L)
            .expiresAt(Instant.now().plusSeconds(3600))
            .isUsed(false)
            .build();
        CompanyMembership existing = CompanyMembership.builder()
            .id(2L)
            .companyId(10L)
            .userId(5L)
            .role(MemberRole.MEMBER)
            .joinedAt(LocalDateTime.now())
            .build();

        when(invitationRepository.findByToken("abc")).thenReturn(Optional.of(invite));
        when(membershipRepository.existsByCompanyIdAndUserId(10L, 5L)).thenReturn(true);
        when(membershipRepository.findByCompanyIdAndUserId(10L, 5L))
            .thenReturn(Optional.of(existing));

        var response = membershipService.acceptInvite(new AcceptInviteRequest("abc"), 5L);

        assertThat(response.companyId()).isEqualTo(10L);
        assertThat(response.userId()).isEqualTo(5L);
    }

    @Test
    void addCreatorAsAdminCreatesMembership() {
        when(membershipRepository.existsByCompanyIdAndUserId(10L, 5L)).thenReturn(false);
        when(membershipRepository.save(any(CompanyMembership.class))).thenAnswer(invocation -> {
            CompanyMembership member = invocation.getArgument(0);
            member.setId(1L);
            return member;
        });

        var response = membershipService.addCreatorAsAdmin(10L, 5L);

        assertThat(response.companyId()).isEqualTo(10L);
        assertThat(response.role()).isEqualTo(MemberRole.RECRUITER_ADMIN);
        verify(membershipRepository).save(any(CompanyMembership.class));
    }
}
