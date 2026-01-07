from typing import Dict
from .retrieval_agent import retrieve_chunks
from .answer_agent import answer_with_citations
from .telemetry import traced_step
from .formatting import parse_answer_raw


def run_qa_pipeline(question: str, top_k: int = 3) -> Dict:
    with traced_step("orchestrator.retrieve", {"top_k": top_k}):
        sources = retrieve_chunks(question, top_k=top_k)

    with traced_step("orchestrator.answer", {"top_k": top_k}):
        result = answer_with_citations(question, sources)

    parsed = parse_answer_raw(result["answer_raw"])

    return {
        "question": question,
        "top_k": top_k,
        "answer": parsed["answer"],
        "citations": parsed["citations"],
        "sources": sources,
        "answer_raw": result["answer_raw"]  # keep for debugging/demo transparency
    }

