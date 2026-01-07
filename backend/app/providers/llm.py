from .config import LLM_PROVIDER

def generate_text(prompt: str) -> str:
    if LLM_PROVIDER == "ollama":
        from .ollama_client import ollama_chat
        return ollama_chat(prompt)

    if LLM_PROVIDER == "openai":
        # Optional stub (not used for execution)
        raise RuntimeError("OpenAI LLM provider not enabled in this demo.")

    raise RuntimeError(f"Unknown LLM_PROVIDER={LLM_PROVIDER}")
