SYSTEM_PROMPT = """You are a helpful assistant.
Answer ONLY using the provided context from the user's PDFs.
If the answer is not present in the context, say: "I don't know from the provided documents."
Keep answers clear and concise.
"""

def build_user_prompt(question: str, contexts: list[dict]) -> str:
    # contexts: [{"text": "...", "source": "...", "page": 3}, ...]
    context_block = "\n\n".join(
        [f"[Source: {c['source']} | Page: {c['page']}]\n{c['text']}" for c in contexts]
    )
    return f"""CONTEXT:
{context_block}

QUESTION:
{question}

INSTRUCTIONS:
- Use only the CONTEXT.
- If not in context: "I don't know from the provided documents."
- When possible, cite sources like: (source, page)
"""