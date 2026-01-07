from typing import List, Dict
from .telemetry import traced_step
from .providers.llm import generate_text


def build_prompt(question: str, sources: List[Dict]) -> str:
    """
    Build a strict prompt that forces the model to only answer from provided sources
    and to cite the sources using [S#] markers.
    """
    sources_text = []
    for i, s in enumerate(sources, start=1):
        meta = s.get("metadata", {})
        source_file = meta.get("source_file", "unknown")
        chunk_index = meta.get("chunk_index", "unknown")
        content = s.get("content", "")
        sources_text.append(
            f"[S{i}] source_file={source_file} chunk_index={chunk_index}\n{content}"
        )

    joined_sources = "\n\n".join(sources_text)

    # VERY strict instruction set so your citations are consistent for the demo
    prompt = f"""
You are a financial document assistant.

RULES:
- Answer ONLY using the SOURCES below.
- If the answer is not in the sources, say: "I don't have enough information in the provided documents."
- Every factual claim must include at least one citation like [S1] or [S2].
- Do NOT cite anything that isn't in SOURCES.
- Keep the answer concise but helpful.

QUESTION:
{question}

SOURCES:
{joined_sources}

Return format:
Answer:
<your answer with citations>

Citations:
- [S#] short description of why it supports the answer
"""
    return prompt.strip()


def answer_with_citations(question: str, sources: List[Dict]) -> Dict:
    with traced_step("answer.build_prompt", {"sources": len(sources)}):
        prompt = build_prompt(question, sources)

    with traced_step("answer.call_llm", {"provider": "configured"}):
        raw = generate_text(prompt)

    return {
        "question": question,
        "answer_raw": raw
    }

