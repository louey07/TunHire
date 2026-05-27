package com.tunhire.tunhire.candidate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidateSkillRepository extends JpaRepository<com.tunhire.tunhire.candidate.entity.CandidateSkill, Long> {
    List<com.tunhire.tunhire.candidate.entity.CandidateSkill> findByProfileId(Long profileId);
    void deleteByIdAndProfileId(Long id, Long profileId);
    void deleteAllByProfileId(Long profileId);
}

