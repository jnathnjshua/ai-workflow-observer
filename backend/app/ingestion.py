import os
import glob
import uuid
import chromadb

from .telemetry import traced_step
from .providers.embeddings import embed_text

CHROMA_PATH = "data/processed/chroma"
COLLECTION_NAME = "financial_docs"


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150):
    chunks = []
    i = 0
    while i < len(text):
        chunk = text[i:i + chunk_size]
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def ingest_raw_docs(raw_docs_dir: str = "data/raw_docs"):
    os.makedirs(CHROMA_PATH, exist_ok=True)

    db = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = db.get_or_create_collection(name=COLLECTION_NAME)

    files = sorted(glob.glob(os.path.join(raw_docs_dir, "*.txt")))
    if not files:
        raise RuntimeError(f"No .txt files found in {raw_docs_dir}")

    with traced_step("ingestion.scan_files", {"count": len(files)}):
        pass

    total_chunks = 0

    for filepath in files:
        filename = os.path.basename(filepath)

        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read().strip()

        chunks = chunk_text(text)
        total_chunks += len(chunks)

        with traced_step(
            "ingestion.embed_file",
            {"file": filename, "chunks": len(chunks)}
        ):
            ids = []
            embeddings = []
            metadatas = []
            documents = []

            for idx, chunk in enumerate(chunks):
                vector = embed_text(chunk)

                ids.append(str(uuid.uuid4()))
                embeddings.append(vector)
                metadatas.append({
                    "source_file": filename,
                    "chunk_index": idx
                })
                documents.append(chunk)

            collection.add(
                ids=ids,
                embeddings=embeddings,
                metadatas=metadatas,
                documents=documents
            )

    with traced_step("ingestion.summary", {"total_chunks": total_chunks}):
        pass

    return {
        "files_ingested": len(files),
        "total_chunks": total_chunks
    }

