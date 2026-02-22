from qdrant_client import QdrantClient
from qdrant_client.http import models as qm
from app.config import QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION

def get_qdrant() -> QdrantClient:
    if QDRANT_API_KEY:
        return QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    return QdrantClient(url=QDRANT_URL)

def ensure_collection(vector_size: int) -> None:
    qc = get_qdrant()
    collections = qc.get_collections().collections
    exists = any(c.name == QDRANT_COLLECTION for c in collections)

    if not exists:
        qc.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=qm.VectorParams(
                size=vector_size,
                distance=qm.Distance.COSINE,
            ),
        )

def upsert_chunks(
    vectors: list[list[float]],
    payloads: list[dict],
    ids: list[str],
) -> None:
    qc = get_qdrant()
    qc.upsert(
        collection_name=QDRANT_COLLECTION,
        points=qm.Batch(
            ids=ids,
            vectors=vectors,
            payloads=payloads,
        ),
    )

def search(query_vector: list[float], top_k: int) -> list[dict]:
    qc = get_qdrant()

    res = qc.query_points(
        collection_name=QDRANT_COLLECTION,
        query=query_vector,          # vector
        limit=top_k,
        with_payload=True,
        with_vectors=False,
    )

    results = []
    for p in res.points:
        results.append({
            "score": float(p.score),
            "payload": p.payload or {},
        })
    return results