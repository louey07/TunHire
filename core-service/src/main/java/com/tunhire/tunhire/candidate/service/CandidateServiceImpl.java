package com.tunhire.tunhire.candidate.service;
import com.tunhire.tunhire.candidate.CandidateService;
import com.tunhire.tunhire.candidate.CandidateProfileResponse;
import com.tunhire.tunhire.candidate.CandidateSkillResponse;
import com.tunhire.tunhire.candidate.SkillRequest;
import com.tunhire.tunhire.candidate.UpdateProfileRequest;
import com.tunhire.tunhire.candidate.entity.CandidateProfile;
import com.tunhire.tunhire.candidate.entity.CandidateSkill;
import com.tunhire.tunhire.candidate.repository.CandidateProfileRepository;
import com.tunhire.tunhire.candidate.repository.CandidateSkillRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tunhire.tunhire.auth.CandidateRegisteredEvent;

@Service
@Transactional
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService {

    private final CandidateProfileRepository profileRepository;
    private final CandidateSkillRepository skillRepository;

    @ApplicationModuleListener
    void onCandidateRegistered(CandidateRegisteredEvent event) {
        profileRepository.findByUserId(event.userId())
            .orElseGet(() -> createEmptyProfile(event.userId()));
    }

    @Override
    @Transactional
    public CandidateProfileResponse getMyProfile(Long userId) {
        CandidateProfile profile = profileRepository
            .findByUserId(userId)
            .orElseGet(() -> createEmptyProfile(userId));
        return mapToResponse(profile);
    }

    @Override
    @Transactional
    public CandidateProfileResponse updateProfile(
        Long userId,
        UpdateProfileRequest request
    ) {
        CandidateProfile profile = profileRepository
            .findByUserId(userId)
            .orElseGet(() -> createEmptyProfile(userId));

        if (request.bio() != null) profile.setBio(request.bio());
        if (request.resumeUrl() != null) profile.setResumeUrl(request.resumeUrl());
        if (request.location() != null) profile.setLocation(request.location());
        if (request.availableFrom() != null) profile.setAvailableFrom(request.availableFrom());
        if (request.yearsOfExperience() != null) profile.setYearsOfExperience(request.yearsOfExperience());

        return mapToResponse(profileRepository.save(profile));
    }

    @Override
    @Transactional
    public CandidateSkillResponse addSkill(Long userId, SkillRequest request) {
        CandidateProfile profile = profileRepository
            .findByUserId(userId)
            .orElseGet(() -> createEmptyProfile(userId));

        CandidateSkill skill = new CandidateSkill();
        skill.setProfileId(profile.getId());
        skill.setSkillName(request.skillName());

        CandidateSkill saved = skillRepository.save(skill);
        return new CandidateSkillResponse(saved.getId(), saved.getSkillName());
    }

    @Override
    @Transactional
    public void removeSkill(Long userId, Long skillId) {
        CandidateProfile profile = profileRepository
            .findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        skillRepository.deleteByIdAndProfileId(skillId, profile.getId());
    }

    @Override
    @Transactional
    public void updateSkillsFromCv(Long userId, List<String> skillNames) {
        CandidateProfile profile = profileRepository
            .findByUserId(userId)
            .orElseGet(() -> createEmptyProfile(userId));

        skillRepository.deleteAllByProfileId(profile.getId());

        skillNames.stream()
            .filter(name -> name != null && !name.isBlank())
            .forEach(name -> {
                CandidateSkill skill = new CandidateSkill();
                skill.setProfileId(profile.getId());
                skill.setSkillName(name);
                skillRepository.save(skill);
            });
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateProfileResponse getPublicProfile(Long userId) {
        CandidateProfile profile = profileRepository
            .findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        return mapToResponse(profile);
    }

    private CandidateProfile createEmptyProfile(Long userId) {
        CandidateProfile profile = new CandidateProfile();
        profile.setUserId(userId);
        return profileRepository.save(profile);
    }

    private CandidateProfileResponse mapToResponse(CandidateProfile profile) {
        List<CandidateSkillResponse> skills = skillRepository
            .findByProfileId(profile.getId())
            .stream()
            .map(s -> new CandidateSkillResponse(s.getId(), s.getSkillName()))
            .collect(Collectors.toList());

        return new CandidateProfileResponse(
            profile.getId(),
            profile.getUserId(),
            profile.getBio(),
            profile.getResumeUrl(),
            profile.getLocation(),
            profile.getAvailableFrom(),
            profile.getYearsOfExperience(),
            skills
        );
    }
}

