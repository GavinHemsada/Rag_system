from google import genai
from app.config import GEMINI_API_KEY, GEMINI_CHAT_MODEL, TOP_K, MAX_CONTEXT_CHUNKS
from app.rag.embeddings import embed_texts
from app.rag.qdrant_store import search
from app.rag.prompts import SYSTEM_PROMPT, build_user_prompt

client = genai.Client(api_key=GEMINI_API_KEY)

def answer_question(question: str) -> dict:
    q_emb = embed_texts([question])[0]
    hits = search(q_emb, top_k=TOP_K)

    contexts = []
    for h in hits[:MAX_CONTEXT_CHUNKS]:
        p = h["payload"]
        contexts.append({
            "text": p.get("text", ""),
            "source": p.get("source", "unknown.pdf"),
            "page": p.get("page", "?"),
            "chunk_id": p.get("chunk_id", ""),
            "score": h["score"],
        })

    user_prompt = build_user_prompt(question, contexts)

    resp = client.models.generate_content(
        model=GEMINI_CHAT_MODEL,
        contents=user_prompt,
        config=genai.types.GenerateContentConfig(
            temperature=0.2,
            system_instruction=SYSTEM_PROMPT,
        ),
    )

    return {
        "answer": resp.text,
        "sources": [
            {
                "content": c["text"],
                "metadata": {
                    "source": c["source"],
                    "page": c["page"],
                    "chunk_id": c["chunk_id"],
                    "score": c["score"],
                }
            }
            for c in contexts
        ],
    }