package com.tunhire.tunhire.candidate;
import com.tunhire.tunhire.common.CandidateSummaryDto;

public interface CandidateProfileProvider {
    CandidateSummaryDto getCandidateSummary(Long userId);
}

