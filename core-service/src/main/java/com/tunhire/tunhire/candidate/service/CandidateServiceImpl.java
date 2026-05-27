package com.tunhire.tunhire.candidate.service;
import com.tunhire.tunhire.applications.JobLookupService;
import com.tunhire.tunhire.applications.entity.Application;
import com.tunhire.tunhire.applications.repository.ApplicationRepository;
import com.tunhire.tunhire.candidate.CandidateService;
import com.tunhire.tunhire.candidate.CandidateProfileResponse;
import com.tunhire.tunhire.candidate.CandidateSkillResponse;
import com.tunhire.tunhire.candidate.CvStorageService;
import com.tunhire.tunhire.candidate.SkillRequest;
import com.tunhire.tunhire.candidate.UpdateProfileRequest;
import com.tunhire.tunhire.candidate.entity.CandidateProfile;
import com.tunhire.tunhire.candidate.entity.CandidateSkill;
import com.tunhire.tunhire.candidate.repository.CandidateProfileRepository;
import com.tunhire.tunhire.candidate.repository.CandidateSkillRepository;
import com.tunhire.tunhire.common.ResourceNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.tunhire.tunhire.auth.CandidateRegisteredEvent;

@Service
@Transactional
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService {

    private final CandidateProfileRepository profileRepository;
    private final CandidateSkillRepository skillRepository;
    private final CvStorageService cvStorageService;
    private final ApplicationRepository applicationRepository;
    private final JobLookupService jobLookupService;

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

    @Override
    @Transactional
    public CandidateProfileResponse storeUploadedCv(
        Long userId,
        MultipartFile file,
        UpdateProfileRequest profileUpdate
    ) {
        CandidateProfile profile = profileRepository
            .findByUserId(userId)
            .orElseGet(() -> createEmptyProfile(userId));

        CvStorageService.StoredCv stored =
            cvStorageService.store(userId, file, profile.getResumeStorageKey());

        profile.setResumeStorageKey(stored.storageKey());
        profile.setResumeFileName(stored.fileName());
        profile.setResumeContentType(stored.contentType());
        profile.setResumeUrl("/candidates/me/resume");

        if (profileUpdate.bio() != null) profile.setBio(profileUpdate.bio());
        if (profileUpdate.location() != null) profile.setLocation(profileUpdate.location());
        if (profileUpdate.availableFrom() != null) profile.setAvailableFrom(profileUpdate.availableFrom());
        if (profileUpdate.yearsOfExperience() != null) {
            profile.setYearsOfExperience(profileUpdate.yearsOfExperience());
        }

        return mapToResponse(profileRepository.save(profile));
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> buildResumeDownload(Long candidateUserId) {
        CandidateProfile profile = profileRepository
            .findByUserId(candidateUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        if (profile.getResumeStorageKey() == null || profile.getResumeStorageKey().isBlank()) {
            throw new ResourceNotFoundException("Resume not found");
        }

        Path path = cvStorageService.resolvePath(profile.getResumeStorageKey());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("Resume not found");
        }

        Resource resource = new FileSystemResource(path);
        String fileName = profile.getResumeFileName() != null
            ? profile.getResumeFileName()
            : "cv.pdf";
        String contentType = profile.getResumeContentType() != null
            ? profile.getResumeContentType()
            : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + fileName.replace("\"", "") + "\""
            )
            .body(resource);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canRecruiterAccessResume(Long recruiterId, Long candidateUserId) {
        List<Application> applications = applicationRepository.findByUserId(candidateUserId);
        return applications.stream()
            .anyMatch(app -> jobLookupService.isRecruiterAuthorizedForJob(app.getJobId(), recruiterId));
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

        boolean hasResume = profile.getResumeStorageKey() != null
            && !profile.getResumeStorageKey().isBlank();

        return new CandidateProfileResponse(
            profile.getId(),
            profile.getUserId(),
            profile.getBio(),
            profile.getResumeUrl(),
            profile.getResumeFileName(),
            hasResume,
            profile.getResumeContentType(),
            profile.getLocation(),
            profile.getAvailableFrom(),
            profile.getYearsOfExperience(),
            skills
        );
    }
}
