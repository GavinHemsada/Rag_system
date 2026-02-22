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
    print("[DEBUG] Health check endpoint called")
    return {"ok": True}

@app.post("/api/v1/ingest/")
async def ingest_pdf(file: UploadFile = File(...)):
    print(f"\n[DEBUG] Ingest endpoint called with file: {file.filename}")
    if not file.filename.lower().endswith((".pdf", ".txt", ".docx")):
        print(f"[ERROR] File format not supported: {file.filename}")
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    print(f"[SUCCESS] File format validated: {file.filename}")

    # Save upload to temp file
    ext = os.path.splitext(file.filename)[1].lower()
    print(f"[DEBUG] File extension: {ext}")
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp_path = tmp.name
        print(f"[DEBUG] Created temp file: {tmp_path}")
        content = await file.read()
        print(f"[DEBUG] Read file content, size: {len(content)} bytes")
        tmp.write(content)

    try:
        if ext == ".txt":
            print(f"[DEBUG] Processing TXT file")
            with open(tmp_path, "r", encoding="utf-8", errors="ignore") as f:
                pages = [{"page": 1, "text": f.read()}]
            print(f"[SUCCESS] TXT file loaded")
        elif ext == ".pdf":
            print(f"[DEBUG] Processing PDF file")
            pages = extract_pdf_text(tmp_path)
            print(f"[SUCCESS] PDF extracted, pages: {len(pages)}")
        else:
            print(f"[ERROR] Unsupported format in try block: {ext}")
            raise HTTPException(status_code=400, detail="Backend does not have text extractors for this file format yet.")

        if not any(p["text"].strip() for p in pages):
            print(f"[ERROR] No text extracted from file")
            raise HTTPException(status_code=400, detail="Could not extract text from PDF (maybe scanned?)")
        
        print(f"[SUCCESS] Text extraction successful, pages with content: {len([p for p in pages if p['text'].strip()])}")

        all_payloads = []
        all_texts = []
        all_ids = []

        for p in pages:
            page_num = p["page"]
            text = p["text"]
            if not text.strip():
                print(f"[DEBUG] Skipping empty page {page_num}")
                continue
            
            print(f"[DEBUG] Processing page {page_num}, text length: {len(text)}")
            chunks = chunk_text_by_tokens(
                text=text,
                chunk_size_tokens=CHUNK_SIZE_TOKENS,
                chunk_overlap_tokens=CHUNK_OVERLAP_TOKENS,
            )
            print(f"[DEBUG] Page {page_num} chunked into {len(chunks)} chunks")

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
        
        print(f"[SUCCESS] Generated {len(all_texts)} total chunks from {len(pages)} pages")

        if not all_texts:
            print(f"[ERROR] No usable text chunks generated")
            raise HTTPException(status_code=400, detail="No usable text chunks were generated")

        print(f"[DEBUG] Starting embedding process for {len(all_texts)} chunks...")
        vectors = embed_texts(all_texts)
        print(f"[SUCCESS] Embedding completed, vector size: {len(vectors[0])}")
        
        print(f"[DEBUG] Ensuring collection with vector size: {len(vectors[0])}")
        ensure_collection(vector_size=len(vectors[0]))
        print(f"[SUCCESS] Collection ensured")
        
        print(f"[DEBUG] Upserting {len(all_ids)} chunks to vector store...")
        upsert_chunks(vectors=vectors, payloads=all_payloads, ids=all_ids)
        print(f"[SUCCESS] Chunks upserted to vector store")

        response = {
            "message": f"Successfully ingested {file.filename} ({len(pages)} pages, {len(all_texts)} chunks)",
            "status": "ingested",
            "file": file.filename,
            "pages": len(pages),
            "chunks": len(all_texts),
        }
        print(f"[SUCCESS] Ingest completed: {response}")
        return response
    finally:
        try:
            os.remove(tmp_path)
            print(f"[SUCCESS] Cleaned up temp file: {tmp_path}")
        except Exception as e:
            print(f"[WARNING] Failed to remove temp file {tmp_path}: {e}")
            pass

@app.post("/api/v1/query/")
def chat(req: QueryReq):
    print(f"\n[DEBUG] Query endpoint called")
    q = req.query.strip()
    print(f"[DEBUG] Query text: {q}")
    print(f"[DEBUG] Top-K parameter: {req.top_k}")
    
    if not q:
        print(f"[ERROR] Empty query provided")
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    print(f"[DEBUG] Processing question: {q[:100]}...")
    result = answer_question(q)
    print(f"[SUCCESS] Query answered, result keys: {list(result.keys())}")
    print(f"[DEBUG] Full result: {result}")
    return result