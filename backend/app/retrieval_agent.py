import chromadb
from typing import List, Dict

from .providers.embeddings import embed_text
from .telemetry import traced_step

CHROMA_PATH = "data/processed/chroma"
COLLECTION_NAME = "financial_docs"


def retrieve_chunks(query: str, top_k: int = 3) -> List[Dict]:
    """
    Given a query, return top_k relevant chunks from the vector store.
    """
    with traced_step("retrieval.embed_query", {"query": query}):
        query_embedding = embed_text(query)

    db = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = db.get_collection(name=COLLECTION_NAME)

    total = collection.count()
    n_results = min(total, max(top_k * 3, top_k))

    with traced_step("retrieval.query_store", {"top_k": top_k, "n_results": n_results}):
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )

    chunks = []
    for i in range(len(results["documents"][0])):
        chunks.append({
            "content": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "id": results["ids"][0][i]
        })

    # DEDUPE: avoid returning the same chunk multiple times
    seen = set()
    deduped = []
    for c in chunks:
        meta = c.get("metadata") or {}
        key = (meta.get("source_file"), meta.get("chunk_index"))
        if key in seen:
            continue
        seen.add(key)
        deduped.append(c)

    return deduped[:top_k]
