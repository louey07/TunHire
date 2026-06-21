import io
import pdfplumber
from fastapi import UploadFile


async def extract_text_from_file(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()

    if not filename.endswith(".pdf"):
        raise ValueError("Unsupported file format. Upload a PDF file.")

    text = ""
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text:
                text += page_text + "\n"
    return "\n".join(line.strip() for line in text.split("\n") if line.strip())
