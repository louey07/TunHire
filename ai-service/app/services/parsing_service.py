import json
import os
import re
from typing import Any, Dict

from dotenv import load_dotenv
load_dotenv()

from groq import Groq

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
    "No markdown, no code blocks, just the raw JSON."
)

_COMMON_LANGUAGES = [
    "Arabe", "Anglais", "Français", "Allemand", "Espagnol",
    "Italien", "Japonais", "Chinois", "Russe", "Portugais",
    "Turc", "Néerlandais", "Polonais", "Arabic", "English",
    "French", "German", "Spanish", "Italian", "Japanese",
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
    "confidence_score": 0.0,
}


def parse_cv_text(text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        return dict(_EMPTY)

    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return dict(_EMPTY)

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
        raw_text = text

        languages_found = list(data.get("languages") or [])
        if not languages_found:
            languages_found = [
                lang for lang in _COMMON_LANGUAGES
                if re.search(rf"\b{lang}\b", raw_text, re.IGNORECASE)
            ]

        print(f"DEBUG languages detected: {languages_found}")
        print(f"DEBUG raw_text contains Arabe: {'Arabe' in raw_text}")

        result = {
            "full_name": str(data.get("full_name") or ""),
            "email": str(data.get("email") or ""),
            "phone": data.get("phone") or None,
            "location": data.get("location") or None,
            "years_experience": int(data.get("years_experience") or 0),
            "skills": list(data.get("skills") or []),
            "languages": languages_found,
            "education": list(data.get("education") or []),
            "confidence_score": 0.95,
        }

        if not result.get("languages"):
            result["languages"] = languages_found

        return result
    except Exception:
        return dict(_EMPTY)
