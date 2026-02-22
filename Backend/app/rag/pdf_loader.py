from pypdf import PdfReader

def extract_pdf_text(pdf_path: str) -> list[dict]:
    """
    Returns list of pages:
    [{ "page": 1, "text": "..." }, ...]
    """
    reader = PdfReader(pdf_path)
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        text = text.replace("\x00", " ").strip()
        pages.append({"page": i, "text": text})
    return pages