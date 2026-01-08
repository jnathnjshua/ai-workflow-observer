from typing import List, Dict, Any
import re

from .telemetry import traced_step
from .providers.llm import generate_text


def build_prompt(question: str, sources: List[Dict[str, Any]]) -> str:
    """
    Build a strict prompt that forces the model to only answer from provided sources
    and to cite the sources using [S#] markers.
    """
    sources_text = []
    for i, s in enumerate(sources, start=1):
        meta = s.get("metadata", {}) or {}
        source_file = meta.get("source_file", "unknown")
        chunk_index = meta.get("chunk_index", "unknown")
        content = s.get("content", "") or ""
        sources_text.append(
            f"[S{i}] source_file={source_file} chunk_index={chunk_index}\n{content}"
        )

    joined_sources = "\n\n".join(sources_text)

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

Return format EXACTLY:

Answer:
- <claim 1> [S#]
- <claim 2> [S#]
- <claim 3> [S#]
(Every bullet MUST end with at least one citation.)

Citations:
- [S#] short description of why it supports the answer
"""
    return prompt.strip()


def _parse_answer_and_citations(answer_raw: str) -> tuple[str, List[Dict[str, str]]]:
    """
    Extract:
      - answer text (everything after 'Answer:' up to 'Citations:')
      - citations list items from the 'Citations:' section
    """
    raw = (answer_raw or "").strip()

    # Default fallback
    answer_text = raw
    citation_items: List[Dict[str, str]] = []

    # Try to split by the "Answer:" and "Citations:" headings
    m = re.search(r"Answer:\s*(.*?)\s*Citations:\s*(.*)$", raw, flags=re.DOTALL | re.IGNORECASE)
    if m:
        answer_text = m.group(1).strip()
        citations_block = m.group(2).strip()

        # Parse bullets like "- [S1] blah blah"
        for line in citations_block.splitlines():
            line = line.strip()
            if not line.startswith("-"):
                continue
            # extract [S#]
            ref_match = re.search(r"\[(S\d+)\]", line)
            if not ref_match:
                continue
            ref = ref_match.group(1)
            # remove "- " prefix and leading ref marker
            note = line.lstrip("-").strip()
            note = re.sub(r"^\[(S\d+)\]\s*", "", note).strip()
            citation_items.append({"ref": ref, "note": note})

    return answer_text, citation_items

def answer_with_citations(question: str, sources: List[Dict]) -> Dict:
    with traced_step("answer.build_prompt", {"sources": len(sources)}):
        prompt = build_prompt(question, sources)

    with traced_step("answer.call_llm", {"provider": "configured"}):
        raw = generate_text(prompt)

    answer_text, citations = _parse_answer_and_citations(raw)

    has_citations_section = re.search(r"Citations:\s*", raw, flags=re.IGNORECASE) is not None
    if has_citations_section and not citations:
        answer_text = re.split(r"Citations:\s*", answer_text, maxsplit=1, flags=re.IGNORECASE)[0].strip()
    answer_text = re.sub(
        r"^\s*(Here is the answer:|Answer:)\s*",
        "",
        answer_text,
        flags=re.IGNORECASE
    ).strip()

    # Absolute fallback: always generate from sources when no citations are parsed.
    if not citations:
        citations = []
        for i, src in enumerate(sources, start=1):
            meta = src.get("metadata", {}) or {}
            source_file = meta.get("source_file", "unknown")
            chunk_index = meta.get("chunk_index", "unknown")
            citations.append({
                "ref": f"S{i}",
                "note": f"Derived from {source_file}, chunk {chunk_index}",
            })

    return {
        "question": question,
        "answer": (answer_text or "").strip(),
        "citations": citations,
        "sources": sources,
        "answer_raw": raw
    }
