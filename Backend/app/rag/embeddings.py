# import google.generativeai as genai
from google import genai
from app.config import GEMINI_API_KEY, GEMINI_EMBED_MODEL

client = genai.Client(api_key=GEMINI_API_KEY)

def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Returns embeddings in the same order as texts.
    """
    if not texts:
        return []
    
    try:
        # Gemini can batch embed texts
        resp = client.models.embed_content(
            model=GEMINI_EMBED_MODEL,
            contents=texts,
            config=genai.types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT"
            )
        )
        
        embeddings = [e.values for e in resp.embeddings]
        
        return embeddings
    
    except Exception as e:
        raise