package com.tunhire.tunhire.candidate;

import java.util.List;

public interface CandidateService {
    CandidateProfileResponse getMyProfile(Long userId);
    CandidateProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    CandidateSkillResponse addSkill(Long userId, SkillRequest request);
    void removeSkill(Long userId, Long skillId);
    CandidateProfileResponse getPublicProfile(Long userId);
    void updateSkillsFromCv(Long userId, List<String> skillNames);
}

