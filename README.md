# AI Workflow Observer

A lightweight, end-to-end AI document analysis pipeline inspired by modern financial research workflows.

This project demonstrates how to ingest, embed, retrieve, and answer questions over structured financial documents with full citation transparency, observability, and a modern UI.

---

## Live Demo (Frontend) + Local Backend Setup

Live site: <PASTE_VERCEL_URL_HERE>

Quick start (local backend + hosted frontend):
1) Install Ollama.
2) Pull required models:
   - `nomic-embed-text`
   - `llama3.1:8b`
3) Run the backend locally:
   - `cd backend`
   - `source .venv/bin/activate`
   - `uvicorn app.main:app --reload --port 8000`
4) Open the hosted site and set the API base URL to:
   - `http://localhost:8000`
5) Test connectivity:
   - Use the Health page in the UI or run a sample Ask query.

Note: The hosted site calls your local backend. Ensure the backend is running and reachable on localhost.

---

## What This Project Does

- Ingests raw financial documents (earnings reports, 10-Qs, financial notes)
- Parses and chunks PDFs into structured text segments
- Embeds documents into a vector store
- Retrieves the most relevant document passages for a given question
- Generates answers **only from retrieved sources**
- Returns citations alongside answers for traceability
- Surfaces system health and operational failures

This mirrors how institutional research platforms analyze, audit, and operationalize financial information.

---

## Architecture Overview

**Raw Docs → Embeddings → Vector Store → Retrieval → Answer Generation → UI**

### Core Components

- **FastAPI backend**
- **ChromaDB** for vector storage
- **Ollama** for local LLM + embeddings
- **SQLite** for incident logging
- **Next.js (App Router)** frontend
- Provider abstraction for vendor flexibility

---

## Providers (Cost Control & Vendor Resilience)

This project supports pluggable providers for both embeddings and LLM generation.

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

> Execution in this repository currently uses Ollama only.

---

## API Endpoints

### POST /ingest_pdf
Uploads and ingests a financial PDF (e.g., 10-Q or earnings report):
- Extracts text
- Chunks content
- Embeds locally
- Stores in ChromaDB with source metadata

### POST /ask
End-to-end QA pipeline:
- Retrieves top-K relevant chunks
- Generates an answer **only from retrieved sources**
- Returns citations and supporting source excerpts

### GET /health
Unified health check:
- Database availability
- Chroma vector store accessibility
- Ollama service status
- Returns overall system status: `ok`, `degraded`, or `down`

### GET /incidents
Returns recent operational incidents for inspection and debugging.

---

## Observability & Incident Tracking

This service includes built-in observability to surface operational issues in the AI workflow.

When critical steps fail (e.g., embedding generation, retrieval, or LLM calls), incidents are automatically recorded to a local SQLite database.

### Incident Logging

Failures in the QA pipeline are logged with:
- Component (e.g., `qa_pipeline`)
- Severity (`warning`, `error`, `critical`)
- Error message
- Timestamp

### Why This Matters

This design demonstrates how AI systems can be made:
- Observable
- Supportable
- Auditable
- Production-ready

Rather than opaque black boxes.

---

## Frontend (Next.js)

The frontend is built with **Next.js (App Router)** and serves as the primary interface for interacting with the AI workflow.

### Core Views

- **Upload** — Upload and ingest financial PDFs
- **Ask** — Query ingested documents with cited answers
- **Incidents** — View logged failures and errors
- **Health** — Inspect system and dependency status

### Design Principles

- Minimalist, linear, dashboard-style UI
- Neutral grayscale palette
- Subtle borders and cards
- Small, readable typography
- No distracting colors or visual noise

The frontend is intentionally styled to resemble internal research or platform tooling rather than a consumer application.

---

## Deploy Frontend to Vercel (Free)

1) Import the GitHub repo into Vercel.
2) Set the root directory to `/frontend` if prompted.
3) Use default build/output settings.
4) Optional env var: `NEXT_PUBLIC_API_BASE` (not required because the API base can be set in the UI).

---

## Why This Exists

This project is designed to demonstrate:

- Production-oriented AI pipelines
- Source-grounded and auditable RAG systems
- Cost control and vendor resilience
- Observability as a first-class concern
- Full-stack ownership (backend, frontend, and operations)

---

## Status

- **Day 1:** Backend & DB setup ✅
- **Day 2:** Ingestion & retrieval pipeline ✅
- **Day 3:** Answer generation with strict citations ✅
- **Day 4:** Production observability (incidents + health checks) ✅
- **Day 5:** Real PDF ingestion + Next.js frontend UI/UX ✅
