from .config import EMBEDDINGS_PROVIDER

def embed_text(text: str) -> list[float]:
    if EMBEDDINGS_PROVIDER == "ollama":
        from .ollama_client import ollama_embed
        return ollama_embed(text)

    if EMBEDDINGS_PROVIDER == "openai":
        # Optional stub (not used for execution)
        raise RuntimeError("OpenAI embeddings provider not enabled in this demo.")

    raise RuntimeError(f"Unknown EMBEDDINGS_PROVIDER={EMBEDDINGS_PROVIDER}")
