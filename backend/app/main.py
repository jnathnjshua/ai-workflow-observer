from .healthchecks import check_db, check_chroma, check_ollama, overall_status
from .models_incident import Incident
from fastapi import HTTPException, Depends, FastAPI
from sqlalchemy.orm import Session
from .db import Base, engine, get_db
from .orchestrator import run_qa_pipeline
from .retrieval_agent import retrieve_chunks
from .ingestion import ingest_raw_docs
from .models import Ping

app = FastAPI(title="AI Workflow Observer API")

# Create tables on startup (simple for Day 1)
Base.metadata.create_all(bind=engine)

@app.get("/health")
def health(db: Session = Depends(get_db)):
    checks = {
        "db": check_db(db),
        "chroma": check_chroma(),
        "ollama": check_ollama()
    }
    return {
        "status": overall_status(checks),
        "checks": checks
    }

# Adding endpoint to FastAPI app
@app.post("/ingest")
def ingest():
    return ingest_raw_docs()

@app.post("/retrieve")
def retrieve(query: str, top_k: int = 3):
    return {
        "query": query,
        "results": retrieve_chunks(query, top_k=top_k)
    }

@app.post("/ask")
def ask(question: str, top_k: int = 3, db: Session = Depends(get_db)):
    try:
        return run_qa_pipeline(question, top_k=top_k, db=db)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@app.get("/incidents")
def list_incidents(limit: int = 20, db: Session = Depends(get_db)):
    rows = (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "component": r.component,
            "severity": r.severity,
            "message": r.message,
            "error": r.error,
            "created_at": r.created_at.isoformat()
        }
        for r in rows
    ]

