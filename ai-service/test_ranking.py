from app.schemas.matching_v2 import CandidateMatchInput, JobMatchInput
from app.services.ranking_service import build_candidate_text, build_job_text, score_candidate
from app.services.rules_service import compute_rules_score


def test_build_job_text_includes_structured_fields():
    job = JobMatchInput(
        title="Développeur Java",
        description="Backend API",
        location="Tunis",
        work_mode="HYBRID",
        contract_type="CDI",
        experience_level="SENIOR",
        salary_min=1200,
        salary_max=1800,
    )
    text = build_job_text(job)
    assert "Développeur Java" in text
    assert "HYBRID" in text
    assert "Backend API" in text


def test_build_candidate_text_includes_profile_fields():
    candidate = CandidateMatchInput(
        candidate_id=1,
        skills=["Java", "Spring"],
        bio="Développeur backend",
        location="Sfax",
        years_experience=4,
        languages=["Français"],
        education=["Licence Informatique"],
        cv_summary="4 ans Java",
    )
    text = build_candidate_text(candidate)
    assert "Java" in text
    assert "Développeur backend" in text
    assert "4 ans Java" in text


def test_rules_flag_incomplete_profile():
    job = JobMatchInput(title="Dev", description="Java", experience_level="JUNIOR")
    candidate = CandidateMatchInput(candidate_id=1, skills=[])
    score, gaps = compute_rules_score(job, candidate)
    assert score == 0
    assert "Profil incomplet" in gaps


def test_rules_penalizes_experience_gap():
    job = JobMatchInput(
        title="Senior Dev",
        description="Java",
        experience_level="SENIOR",
    )
    candidate = CandidateMatchInput(
        candidate_id=1,
        skills=["Java"],
        years_experience=1,
    )
    score, gaps = compute_rules_score(job, candidate)
    assert score < 100
    assert any("Expérience" in gap for gap in gaps)


def test_score_candidate_returns_bounded_score():
    job = JobMatchInput(
        title="Java Developer",
        description="Spring Boot REST API PostgreSQL",
        location="Tunis",
        experience_level="JUNIOR",
    )
    candidate = CandidateMatchInput(
        candidate_id=1,
        skills=["Java", "Spring Boot", "PostgreSQL"],
        years_experience=2,
        location="Tunis",
    )
    result = score_candidate(job, candidate, llm_result=None)
    assert 0 <= result.score <= 100
    assert result.level
    assert isinstance(result.matched_skills, list)


if __name__ == "__main__":
    import sys

    tests = [
        test_build_job_text_includes_structured_fields,
        test_build_candidate_text_includes_profile_fields,
        test_rules_flag_incomplete_profile,
        test_rules_penalizes_experience_gap,
        test_score_candidate_returns_bounded_score,
    ]
    failed = 0
    for test_fn in tests:
        try:
            test_fn()
            print(f"OK {test_fn.__name__}")
        except Exception as exc:
            failed += 1
            print(f"FAIL {test_fn.__name__}: {exc}", file=sys.stderr)
    sys.exit(1 if failed else 0)
