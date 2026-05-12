package com.tunhire.tunhire.candidate.controller;

import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.candidate.CandidateProfileResponse;
import com.tunhire.tunhire.candidate.CandidateSkillResponse;
import com.tunhire.tunhire.candidate.SkillRequest;
import com.tunhire.tunhire.candidate.UpdateProfileRequest;
import com.tunhire.tunhire.candidate.CandidateService;
import com.tunhire.tunhire.common.AiServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/candidates")
@RequiredArgsConstructor
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
        AiServiceClient.CvParseResult result = aiServiceClient.parseCv(file);
        System.out.println("DEBUG parsed location: " + result.location());
        System.out.println("DEBUG parsed years: " + result.yearsExperience());
        System.out.println("DEBUG profile update called");
        if (result != null) {
            if (result.skills() != null) {
                candidateService.updateSkillsFromCv(userId, result.skills());
            }
            UpdateProfileRequest profileUpdate = new UpdateProfileRequest(
                null,
                null,
                result.location(),
                null,
                result.yearsExperience() > 0 ? result.yearsExperience() : null
            );
            candidateService.updateProfile(userId, profileUpdate);
        }
        return ResponseEntity.ok(candidateService.getMyProfile(userId));
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
