from typing import Dict
from sqlalchemy.orm import Session

from .retrieval_agent import retrieve_chunks
from .answer_agent import answer_with_citations
from .telemetry import traced_step
from .incidents import create_incident


def run_qa_pipeline(question: str, top_k: int, db: Session) -> Dict:
    """
    Runs the QA pipeline and logs incidents to DB on failure.
    """
    try:
        with traced_step("orchestrator.retrieve", {"top_k": top_k}):
            sources = retrieve_chunks(question, top_k=top_k)

        with traced_step("orchestrator.answer", {"top_k": top_k}):
            result = answer_with_citations(question, sources)

        return {
            "question": question,
            "top_k": top_k,
            "answer": result["answer"],
            "citations": result["citations"],
            "sources": sources,
            "answer_raw": result["answer_raw"]
        }

    except Exception as e:
        # Log incident to DB
        create_incident(
            db=db,
            component="qa_pipeline",
            severity="critical",
            message="QA pipeline failed",
            error=repr(e)
        )
        # Re-raise for FastAPI handler to return 503
        raise
