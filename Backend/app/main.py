import os
import uuid
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import CHUNK_SIZE_TOKENS, CHUNK_OVERLAP_TOKENS
from app.rag.pdf_loader import extract_pdf_text
from app.rag.chunking import chunk_text_by_tokens
from app.rag.embeddings import embed_texts
from app.rag.qdrant_store import ensure_collection, upsert_chunks
from app.rag.rag_pipeline import answer_question

app = FastAPI(title="PDF RAG System (FastAPI + Qdrant)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryReq(BaseModel):
    query: str
    top_k: int = 4

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/api/v1/ingest/")
async def ingest_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".pdf", ".txt", ".docx")):
        raise HTTPException(status_code=400, detail="Unsupported file format")

    # Save upload to temp file
    ext = os.path.splitext(file.filename)[1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp_path = tmp.name
        content = await file.read()
        tmp.write(content)

    try:
        if ext == ".txt":
            with open(tmp_path, "r", encoding="utf-8", errors="ignore") as f:
                pages = [{"page": 1, "text": f.read()}]
        elif ext == ".pdf":
            pages = extract_pdf_text(tmp_path)
        else:
            raise HTTPException(status_code=400, detail="Backend does not have text extractors for this file format yet.")

        if not any(p["text"].strip() for p in pages):
            raise HTTPException(status_code=400, detail="Could not extract text from PDF (maybe scanned?)")

        all_payloads = []
        all_texts = []
        all_ids = []

        for p in pages:
            page_num = p["page"]
            text = p["text"]
            if not text.strip():
                continue
            
            chunks = chunk_text_by_tokens(
                text=text,
                chunk_size_tokens=CHUNK_SIZE_TOKENS,
                chunk_overlap_tokens=CHUNK_OVERLAP_TOKENS,
            )

            for idx, ch in enumerate(chunks):
                chunk_id = f"{file.filename}-p{page_num}-c{idx}"
                uid = str(uuid.uuid4())

                payload = {
                    "text": ch,
                    "source": file.filename,
                    "page": page_num,
                    "chunk_id": chunk_id,
                }

                all_texts.append(ch)
                all_payloads.append(payload)
                all_ids.append(uid)
        
        if not all_texts:
            raise HTTPException(status_code=400, detail="No usable text chunks were generated")

        vectors = embed_texts(all_texts)
        
        ensure_collection(vector_size=len(vectors[0]))
        
        upsert_chunks(vectors=vectors, payloads=all_payloads, ids=all_ids)

        response = {
            "message": f"Successfully ingested {file.filename} ({len(pages)} pages, {len(all_texts)} chunks)",
            "status": "ingested",
            "file": file.filename,
            "pages": len(pages),
            "chunks": len(all_texts),
        }
        return response
    finally:
        try:
            os.remove(tmp_path)
        except Exception as e:
            pass

@app.post("/api/v1/query/")
def chat(req: QueryReq):
    q = req.query.strip()
    
    if not q:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    result = answer_question(q)
    return result