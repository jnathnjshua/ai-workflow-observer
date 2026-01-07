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

    with traced_step("retrieval.query_store", {"top_k": top_k}):
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

    chunks = []
    for i in range(len(results["documents"][0])):
        chunks.append({
            "content": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "id": results["ids"][0][i]
        })

    return chunks

