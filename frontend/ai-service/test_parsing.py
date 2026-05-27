import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.services.parsing_service import parse_cv_text

CV_PATH = os.path.join(os.path.dirname(__file__), "data", "cv_ahmed_bensalah.pdf")

FAKE_CV = """Ahmed Ben Salah
ahmed.bensalah@email.com
+216 22 345 678
Tunis, Tunisie

PROFIL
Développeur Full Stack avec 3 ans d'expérience en développement d'applications web.

COMPÉTENCES
Java, Spring Boot, React, Python, Docker, PostgreSQL, Git, Linux, Redis, Angular

FORMATION
Licence en Informatique - Université de Tunis El Manar (2018-2021)
Master Génie Logiciel - ENSI (2021-2023)

EXPÉRIENCE
Développeur Backend - Vermeg (2023 - présent)
  - Développement de microservices avec Spring Boot
  - Intégration de bases de données PostgreSQL

Stage - Telnet (2022)
  - Développement d'une application React
"""


def load_text_from_pdf(path: str) -> str:
    try:
        import pdfplumber
    except ImportError:
        print("[warning] pdfplumber not installed — falling back to fake CV text")
        return None

    try:
        with pdfplumber.open(path) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
        text = "\n".join(pages).strip()
        if not text:
            print(f"[warning] PDF at {path!r} yielded no text — falling back to fake CV text")
            return None
        print(f"[info] Extracted {len(text)} characters from {path!r}")
        return text
    except Exception as exc:
        print(f"[warning] Could not read PDF ({exc}) — falling back to fake CV text")
        return None


def main():
    text = None

    if os.path.exists(CV_PATH):
        text = load_text_from_pdf(CV_PATH)

    if text is None:
        print("[info] Using built-in fake CV text")
        text = FAKE_CV

    result = parse_cv_text(text)

    # raw_text is verbose — truncate for display
    display = {**result, "raw_text": result["raw_text"][:120] + "..."}
    print(json.dumps(display, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
