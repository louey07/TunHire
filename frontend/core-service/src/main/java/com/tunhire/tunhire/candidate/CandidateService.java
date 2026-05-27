package com.tunhire.tunhire.candidate;

import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface CandidateService {
    CandidateProfileResponse getMyProfile(Long userId);
    CandidateProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    CandidateSkillResponse addSkill(Long userId, SkillRequest request);
    void removeSkill(Long userId, Long skillId);
    CandidateProfileResponse getPublicProfile(Long userId);
    void updateSkillsFromCv(Long userId, List<String> skillNames);
    CandidateProfileResponse storeUploadedCv(
        Long userId,
        MultipartFile file,
        UpdateProfileRequest profileUpdate
    );
    ResponseEntity<Resource> buildResumeDownload(Long candidateUserId);
    boolean canRecruiterAccessResume(Long recruiterId, Long candidateUserId);
}
