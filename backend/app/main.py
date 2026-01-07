from .orchestrator import run_qa_pipeline
from .retrieval_agent import retrieve_chunks
from .ingestion import ingest_raw_docs
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .db import Base, engine, get_db
from .models import Ping

app = FastAPI(title="AI Workflow Observer API")

# Create tables on startup (simple for Day 1)
Base.metadata.create_all(bind=engine)

@app.get("/health")
def health(db: Session = Depends(get_db)):
    # write a row to prove DB works
    ping = Ping(message="ok")
    db.add(ping)
    db.commit()
    return {"status": "ok", "db_write": "success"}

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
def ask(question: str, top_k: int = 3):
    return run_qa_pipeline(question, top_k=top_k)

@app.post("/ask")
def ask(question: str, top_k: int = 3):
    try:
        return run_qa_pipeline(question, top_k=top_k)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

