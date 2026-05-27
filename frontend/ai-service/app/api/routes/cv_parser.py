from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.cv import CVParseResult
from app.utils.text_extractor import extract_text_from_file
from app.services.parsing_service import parse_cv_text

router = APIRouter()


@router.post("/parse", response_model=CVParseResult)
async def parse_cv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed.")

    try:
        text = await extract_text_from_file(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {e}")

    parsed = parse_cv_text(text)

    return CVParseResult(
        full_name=parsed["full_name"],
        email=parsed["email"],
        phone=parsed.get("phone"),
        location=parsed.get("location"),
        years_experience=parsed["years_experience"],
        skills=parsed["skills"],
        languages=parsed.get("languages", []),
        education=parsed["education"],
        raw_text=text,
        parser_version="1.0.0",
        confidence_score=parsed["confidence_score"],
    )
