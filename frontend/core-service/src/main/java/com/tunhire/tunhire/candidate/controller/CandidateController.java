package com.tunhire.tunhire.candidate.controller;

import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.candidate.CandidateProfileResponse;
import com.tunhire.tunhire.candidate.CandidateSkillResponse;
import com.tunhire.tunhire.candidate.SkillRequest;
import com.tunhire.tunhire.candidate.UpdateProfileRequest;
import com.tunhire.tunhire.candidate.CandidateService;
import com.tunhire.tunhire.common.AiServiceClient;
import com.tunhire.tunhire.common.AiServiceUnavailableException;
import com.tunhire.tunhire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/candidates")
@RequiredArgsConstructor
@Slf4j
public class CandidateController {

    private final CandidateService candidateService;
    private final AuthService authService;
    private final AiServiceClient aiServiceClient;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileResponse> getMyProfile(Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(candidateService.getMyProfile(userId));
    }

    @GetMapping("/me/resume")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Resource> downloadMyResume(Authentication authentication) {
        Long userId = extractUserId(authentication);
        return candidateService.buildResumeDownload(userId);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(candidateService.updateProfile(userId, request));
    }

    @PostMapping("/me/skills")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateSkillResponse> addSkill(
            Authentication authentication,
            @RequestBody SkillRequest request) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(candidateService.addSkill(userId, request));
    }

    @DeleteMapping("/me/skills/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Void> removeSkill(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = extractUserId(authentication);
        candidateService.removeSkill(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/cv/parse")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileResponse> parseCv(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        Long userId = extractUserId(authentication);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("CV file is required.");
        }

        AiServiceClient.CvParseResult result = aiServiceClient.parseCv(file);
        if (result == null) {
            throw new AiServiceUnavailableException(
                "CV parsing service is unavailable. Start the AI service on port 8000."
            );
        }

        if (result.skills() != null && !result.skills().isEmpty()) {
            candidateService.updateSkillsFromCv(userId, result.skills());
            log.info("Imported {} skills from CV for user {}", result.skills().size(), userId);
        } else {
            log.warn("CV parsed for user {} but no skills were extracted", userId);
        }

        UpdateProfileRequest profileUpdate = new UpdateProfileRequest(
            null,
            null,
            result.location(),
            null,
            result.yearsExperience() > 0 ? result.yearsExperience() : null
        );

        return ResponseEntity.ok(
            candidateService.storeUploadedCv(userId, file, profileUpdate)
        );
    }

    @GetMapping("/{userId}/resume")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Resource> downloadCandidateResume(
            Authentication authentication,
            @PathVariable Long userId) {
        Long recruiterId = extractUserId(authentication);
        if (!candidateService.canRecruiterAccessResume(recruiterId, userId)) {
            throw new ResourceNotFoundException("Resume not found");
        }
        return candidateService.buildResumeDownload(userId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<CandidateProfileResponse> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getPublicProfile(id));
    }

    private Long extractUserId(Authentication authentication) {
        return authService.getUserIdByEmail(authentication.getName());
    }
}
