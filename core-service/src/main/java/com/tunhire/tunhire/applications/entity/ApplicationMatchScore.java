package com.tunhire.tunhire.applications.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "application_match_scores")
public class ApplicationMatchScore {

    @Id
    @Column(name = "application_id")
    private Long applicationId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    private Integer score;

    @Column(length = 32)
    private String level;

    @Column(name = "matched_skills", columnDefinition = "TEXT")
    private String matchedSkillsJson;

    @Column(columnDefinition = "TEXT")
    private String gapsJson;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "job_version_hash", length = 64)
    private String jobVersionHash;

    @Column(name = "profile_version_hash", length = 64)
    private String profileVersionHash;

    @Column(name = "scorer_version", length = 16)
    private String scorerVersion;

    @Column(name = "computed_at", nullable = false)
    private Instant computedAt;
}
