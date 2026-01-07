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

## Status

- Day 1: Backend & DB setup ✅
- Day 2: Ingestion & retrieval pipeline ✅
- Day 3: Answer generation with citations ✅
