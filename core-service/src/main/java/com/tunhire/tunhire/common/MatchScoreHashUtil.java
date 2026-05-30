package com.tunhire.tunhire.common;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tunhire.tunhire.candidate.entity.CandidateProfile;
import com.tunhire.tunhire.job_offers.entity.Job;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

public final class MatchScoreHashUtil {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private MatchScoreHashUtil() {}

    public static String computeJobVersionHash(Job job) {
        String payload = String.join(
            "|",
            nullSafe(job.getTitle()),
            nullSafe(job.getDescription()),
            nullSafe(job.getLocation()),
            job.getWorkMode() != null ? job.getWorkMode().name() : "",
            nullSafe(job.getContractType()),
            nullSafe(job.getExperienceLevel()),
            job.getSalaryMin() != null ? job.getSalaryMin().toPlainString() : "",
            job.getSalaryMax() != null ? job.getSalaryMax().toPlainString() : ""
        );
        return sha256(payload);
    }

    public static String computeProfileVersionHash(
        CandidateProfile profile,
        List<String> skillNames
    ) {
        List<String> sortedSkills = skillNames.stream()
            .filter(s -> s != null && !s.isBlank())
            .map(String::trim)
            .sorted(String.CASE_INSENSITIVE_ORDER)
            .collect(Collectors.toList());

        String payload = String.join(
            "|",
            nullSafe(profile.getBio()),
            nullSafe(profile.getLocation()),
            profile.getYearsOfExperience() != null
                ? profile.getYearsOfExperience().toString()
                : "",
            profile.getAvailableFrom() != null
                ? profile.getAvailableFrom().toString()
                : "",
            nullSafe(profile.getResumeStorageKey()),
            nullSafe(profile.getCvSummary()),
            nullSafe(profile.getEducationJson()),
            nullSafe(profile.getLanguagesJson()),
            String.join(",", sortedSkills)
        );
        return sha256(payload);
    }

    public static String toJson(List<String> values) {
        try {
            return MAPPER.writeValueAsString(values != null ? values : List.of());
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    public static List<String> fromJson(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return MAPPER.readValue(
                json,
                MAPPER.getTypeFactory().constructCollectionType(List.class, String.class)
            );
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }

    private static String nullSafe(String value) {
        return value != null ? value : "";
    }

    private static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
