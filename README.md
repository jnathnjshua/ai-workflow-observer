# AI Workflow Observer

A lightweight, end-to-end AI document analysis pipeline inspired by modern financial research workflows.

This project demonstrates how to ingest, embed, retrieve, and answer questions over structured financial documents with full citation transparency.

---

## What This Project Does

- Ingests raw financial documents (earnings reports, 10-Q excerpts, notes)
- Chunks and embeds documents into a vector store
- Retrieves the most relevant document passages for a given question
- Generates answers **only from retrieved sources**
- Returns citations alongside answers for traceability

This mirrors how institutional research platforms analyze and audit financial information.

---

## Architecture Overview

Raw Docs → Embeddings → Vector Store → Retrieval → Answer Generation


Key components:
- FastAPI backend
- ChromaDB for vector storage
- Ollama for local LLM + embeddings
- Provider abstraction for vendor flexibility

---

## Providers (Cost Control & Vendor Resilience)

This project supports **pluggable providers** for both embeddings and LLM generation.

### Default: Ollama (Local, No Cost)

Runs fully locally using Ollama:
- No per-request cost
- Ideal for development, demos, and cost control
- Works on Apple Silicon

Configured via environment variables:

LLM_PROVIDER=ollama

EMBEDDINGS_PROVIDER=ollama


### Optional: OpenAI (Cloud)

The architecture supports OpenAI as a drop-in replacement:

LLM_PROVIDER=openai

EMBEDDINGS_PROVIDER=openai


This allows:
- Vendor redundancy
- Cost-aware switching
- Graceful fallback during outages

Execution in this repository uses **Ollama only**.

---

## API Endpoints

### POST /ingest

Ingests and embeds raw documents.

### POST /retrieve

Retrieves top-K relevant document chunks for a query.

### POST /ask

End-to-end QA pipeline:
- Retrieves relevant sources
- Generates an answer from those sources only
- Returns citations and supporting documents

---

## Why This Exists

This project is designed to demonstrate:
- Production-oriented AI pipelines
- Observability and traceability in AI systems
- Cost control and vendor resilience
- Clear separation of concerns (ingest, retrieve, answer)

---

## Observability & Incident Tracking

This service includes built-in observability to surface operational issues in the AI workflow.

When critical steps fail (e.g., embedding generation, LLM calls, or provider outages), incidents are automatically recorded to a local SQLite database for inspection and debugging.

### Incident Logging
- Failures in the QA pipeline (retrieval, embeddings, or answer generation) are logged as incidents
- Each incident records:
  - component (e.g., `qa_pipeline`)
  - severity (`warning`, `error`, `critical`)
  - error message
  - timestamp

### Health Checks
The service exposes a unified health endpoint to monitor subsystem status:

- `GET /health`
  - Checks database availability
  - Verifies Chroma vector store accessibility
  - Confirms Ollama service availability
  - Returns overall system status: `ok`, `degraded`, or `down`

### Incident API
- `GET /incidents`
  - Returns recent operational incidents
  - Useful for debugging, audits, and postmortems

This design demonstrates how AI systems can be made **observable, supportable, and production-ready**, rather than treated as opaque black boxes.

---
## Status

- Day 1: Backend & DB setup ✅
- Day 2: Ingestion & retrieval pipeline ✅
- Day 3: Answer generation with citations ✅
- Day 4: Production observability added, including automatic incident logging and health checks across DB, vector store, and LLM provider ✅

