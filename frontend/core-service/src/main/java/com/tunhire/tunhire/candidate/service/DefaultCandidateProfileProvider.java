package com.tunhire.tunhire.candidate.service;

import com.tunhire.tunhire.auth.UserDto;
import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.candidate.entity.CandidateProfile;
import com.tunhire.tunhire.candidate.repository.CandidateProfileRepository;
import com.tunhire.tunhire.candidate.CandidateProfileProvider;
import com.tunhire.tunhire.common.CandidateSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DefaultCandidateProfileProvider implements CandidateProfileProvider {

    private final CandidateProfileRepository profileRepository;
    private final AuthService authService;

    @Override
    @Transactional(readOnly = true)
    public CandidateSummaryDto getCandidateSummary(Long userId) {
        UserDto user = authService.getUserById(userId);
        Optional<CandidateProfile> profile = profileRepository.findByUserId(userId);
        return new CandidateSummaryDto(
                userId,
                user.firstName(),
                user.lastName(),
                profile.map(CandidateProfile::getResumeUrl).orElse(null)
        );
    }
}

