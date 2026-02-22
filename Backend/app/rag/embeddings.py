# import google.generativeai as genai
from google import genai
from app.config import GEMINI_API_KEY, GEMINI_EMBED_MODEL

client = genai.Client(api_key=GEMINI_API_KEY)

def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Returns embeddings in the same order as texts.
    """
    print(f"\n[DEBUG] embed_texts() called with {len(texts)} texts")
    
    if not texts:
        print(f"[WARNING] Empty texts list provided to embed_texts()")
        return []
    
    print(f"[DEBUG] Texts to embed: {[f'{t[:50]}...' if len(t) > 50 else t for t in texts[:3]]}")
    
    try:
        # Gemini can batch embed texts
        print(f"[DEBUG] Calling Gemini API with model: {GEMINI_EMBED_MODEL}")
        print(f"[DEBUG] API Key present: {bool(GEMINI_API_KEY)}")
        
        resp = client.models.embed_content(
            model=GEMINI_EMBED_MODEL,
            contents=texts,
            config=genai.types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT"
            )
        )
        print(f"[DEBUG] API Response received: {type(resp)}")
        print(f"[DEBUG] Response object: {resp}")
        
        print(f"[SUCCESS] Embeddings generated successfully")
        
        embeddings = [e.values for e in resp.embeddings]
        print(f"[DEBUG] Generated {len(embeddings)} embeddings, vector size: {len(embeddings[0]) if embeddings else 0}")
        print(f"[SUCCESS] embed_texts() completed successfully")
        
        return embeddings
    
    except Exception as e:
        print(f"[ERROR] Failed to embed texts: {type(e).__name__}: {str(e)}")
        print(f"[ERROR] Full exception: {e}")
        raise