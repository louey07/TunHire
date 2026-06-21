package com.tunhire.tunhire.candidate.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;


import java.time.LocalDate;



@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "candidate_profiles", uniqueConstraints = {
    @UniqueConstraint(columnNames = "user_id")
})
public class CandidateProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    private String bio;

    private String resumeUrl;

    private String resumeStorageKey;

    private String resumeFileName;

    private String resumeContentType;

    private String location;

    private LocalDate availableFrom;

    private Integer yearsOfExperience;

    @Column(name = "cv_summary", columnDefinition = "TEXT")
    private String cvSummary;

    @Column(name = "education_json", columnDefinition = "TEXT")
    private String educationJson;

    @Column(name = "languages_json", columnDefinition = "TEXT")
    private String languagesJson;

    @Column(name = "profile_version_hash", length = 64)
    private String profileVersionHash;
}

