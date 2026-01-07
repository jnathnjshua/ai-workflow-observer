import httpx
from .config import OLLAMA_BASE_URL, OLLAMA_CHAT_MODEL, OLLAMA_EMBED_MODEL

def ollama_embed(text: str) -> list[float]:
    url = f"{OLLAMA_BASE_URL}/api/embeddings"
    payload = {"model": OLLAMA_EMBED_MODEL, "prompt": text}
    try:
        r = httpx.post(url, json=payload, timeout=30)
        r.raise_for_status()
        return r.json()["embedding"]
    except Exception as e:
        raise RuntimeError(f"Ollama embedding failed. Is Ollama running at {OLLAMA_BASE_URL}? Err={repr(e)}")

def ollama_chat(prompt: str) -> str:
    url = f"{OLLAMA_BASE_URL}/api/generate"
    payload = {"model": OLLAMA_CHAT_MODEL, "prompt": prompt, "stream": False}
    try:
        r = httpx.post(url, json=payload, timeout=90)
        r.raise_for_status()
        return r.json()["response"]
    except Exception as e:
        raise RuntimeError(f"Ollama chat failed. Is Ollama running at {OLLAMA_BASE_URL}? Err={repr(e)}")

