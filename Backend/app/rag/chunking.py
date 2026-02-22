import tiktoken

def chunk_text_by_tokens(
    text: str,
    chunk_size_tokens: int,
    chunk_overlap_tokens: int,
    encoding_name: str = "cl100k_base",
) -> list[str]:
    enc = tiktoken.get_encoding(encoding_name)
    tokens = enc.encode(text)

    chunks = []
    start = 0
    while start < len(tokens):
        end = min(start + chunk_size_tokens, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_text = enc.decode(chunk_tokens).strip()
        if chunk_text:
            chunks.append(chunk_text)

        if end == len(tokens):
            break
        start = max(0, end - chunk_overlap_tokens)

    return chunks