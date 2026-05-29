import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

from groq import Groq

logger = logging.getLogger(__name__)

_GROQ_MODEL = "llama-3.3-70b-versatile"

_PROMPT = (
    "You are a CV parser. Extract information from this CV text "
    "and return ONLY a valid JSON object with exactly these fields:\n"
    "- full_name: string — extract the full name with correct spacing "
    "between first name and last name. "
    "The name may have spaces between each letter like "
    "'S O U I L H I L O U E Y' — remove those spaces and "
    "reconstruct the full name correctly as 'Souilhi Louey'\n"
    "- email: string\n"
    "- phone: string\n"
    "- location: string (city only)\n"
    "- years_experience: integer\n"
    "- skills: list of strings — include ALL skills mentioned: "
    "technical skills, soft skills, tools, frameworks. "
    "Each item maximum 5 words. No sentences. No section headers. "
    "Do NOT include languages (Arabic, French, English, Italian etc) "
    "in skills. Languages belong to a separate category. "
    "Only include technical skills and soft skills. "
    "Do not include generic category words like 'Mobile', 'Backend', "
    "'Frontend' as skills. Only include specific tool or technology names.\n"
    "- education: list of strings (each item is one diploma "
    "with school name)\n"
    "- languages: list of strings. Look for a LANGUES or LANGUAGES "
    "section in the CV. Extract only the language names without "
    "the level. Example: ['Arabe', 'Anglais', 'Français', 'Italien']. "
    "If no language section found, return empty list.\n"
    "- cv_summary: string — a concise professional summary in French "
    "(2-4 sentences, max 500 characters) describing the candidate's "
    "profile, experience, and strengths.\n"
    "No markdown, no code blocks, just the raw JSON."
)

_COMMON_LANGUAGES = [
    "Arabe", "Anglais", "Français", "Allemand", "Espagnol",
    "Italien", "Japonais", "Chinois", "Russe", "Portugais",
    "Turc", "Néerlandais", "Polonais", "Arabic", "English",
    "French", "German", "Spanish", "Italian", "Japanese",
]

_KNOWN_TECHNOLOGIES = [
    "Java", "Python", "JavaScript", "TypeScript", "React", "Angular", "Vue",
    "Node.js", "Spring Boot", "Spring", "Docker", "Kubernetes", "PostgreSQL",
    "MySQL", "MongoDB", "Redis", "AWS", "Azure", "Git", "CI/CD", "HTML", "CSS",
    "Tailwind", "Next.js", "FastAPI", "Django", "Flask", "C#", ".NET", "Go",
    "Rust", "Kotlin", "Swift", "Flutter", "Android", "iOS", "Linux", "Agile",
    "Scrum", "Jenkins", "Terraform", "GraphQL", "REST", "Microservices",
    "Hibernate", "Maven", "Gradle", "JUnit", "Kafka", "RabbitMQ", "Elasticsearch",
]

_EMPTY: Dict[str, Any] = {
    "full_name": "",
    "email": "",
    "phone": None,
    "location": None,
    "years_experience": 0,
    "skills": [],
    "languages": [],
    "education": [],
    "cv_summary": "",
    "confidence_score": 0.0,
}


def _extract_skills_fallback(text: str) -> List[str]:
    """Heuristic skill extraction when Groq is unavailable or returns nothing."""
    skills: List[str] = []
    seen: set[str] = set()

    def add(skill: str) -> None:
        cleaned = skill.strip().strip("-•·").strip()
        if not cleaned or len(cleaned) > 50 or len(cleaned.split()) > 5:
            return
        key = cleaned.lower()
        if key in seen:
            return
        seen.add(key)
        skills.append(cleaned)

    section = re.search(
        r"(?is)(compétences|competences|skills|technical skills|technologies|"
        r"tech stack|outils)\s*[:\-]?\s*(.+?)(?:\n\s*\n|\n(?:expérience|experience|"
        r"éducation|education|langues|languages|projets|projects)\b|$)",
        text,
    )
    if section:
        for part in re.split(r"[,;|•/\n]", section.group(2)):
            add(part)

    inline = re.search(r"(?is)\bskills?\s*[:\-]\s*([^\n]+)", text)
    if inline:
        for part in re.split(r"[,;|•]", inline.group(1)):
            add(part)

    text_lower = text.lower()
    for tech in _KNOWN_TECHNOLOGIES:
        if tech.lower() in text_lower:
            add(tech)

    return skills[:30]


def _apply_fallback_skills(result: Dict[str, Any], text: str) -> Dict[str, Any]:
    if result.get("skills"):
        return result
    fallback = _extract_skills_fallback(text)
    if fallback:
        result["skills"] = fallback
        result["confidence_score"] = max(float(result.get("confidence_score") or 0), 0.4)
        logger.info("Applied fallback skill extraction (%d skills)", len(fallback))
    return result


def parse_cv_text(text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        logger.warning("CV parse skipped: extracted text is empty")
        return dict(_EMPTY)

    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        logger.warning("GROQ_API_KEY not set; using fallback skill extraction only")
        result = dict(_EMPTY)
        return _apply_fallback_skills(result, text)

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=_GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": f"{_PROMPT}\n\nCV TEXT:\n{text[:8000]}",
                }
            ],
            temperature=0,
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)

        languages_found = list(data.get("languages") or [])
        if not languages_found:
            languages_found = [
                lang for lang in _COMMON_LANGUAGES
                if re.search(rf"\b{lang}\b", text, re.IGNORECASE)
            ]

        result = {
            "full_name": str(data.get("full_name") or ""),
            "email": str(data.get("email") or ""),
            "phone": data.get("phone") or None,
            "location": data.get("location") or None,
            "years_experience": int(data.get("years_experience") or 0),
            "skills": list(data.get("skills") or []),
            "languages": languages_found,
            "education": list(data.get("education") or []),
            "cv_summary": str(data.get("cv_summary") or "")[:500],
            "confidence_score": 0.95,
        }

        return _apply_fallback_skills(result, text)
    except Exception:
        logger.exception("Groq CV parsing failed")
        result = dict(_EMPTY)
        return _apply_fallback_skills(result, text)
