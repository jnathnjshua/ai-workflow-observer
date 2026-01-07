import httpx
import chromadb
from sqlalchemy.orm import Session

from .models import Ping
from .providers.config import OLLAMA_BASE_URL

CHROMA_PATH = "data/processed/chroma"
COLLECTION_NAME = "financial_docs"


def check_db(db: Session) -> dict:
    # lightweight DB check: write + read
    ping = Ping(message="healthcheck")
    db.add(ping)
    db.commit()
    return {"status": "ok"}


def check_chroma() -> dict:
    try:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        collection = client.get_collection(name=COLLECTION_NAME)
        count = collection.count()
        return {"status": "ok", "doc_count": count}
    except Exception as e:
        return {"status": "down", "error": repr(e)}


def check_ollama() -> dict:
    try:
        r = httpx.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        r.raise_for_status()
        data = r.json()
        models = [m.get("name") for m in data.get("models", []) if m.get("name")]
        return {"status": "ok", "models": models}
    except Exception as e:
        return {"status": "down", "error": repr(e)}


def overall_status(checks: dict) -> str:
    # If anything is down => degraded; if db is down => down
    if checks["db"]["status"] != "ok":
        return "down"
    if any(v.get("status") != "ok" for k, v in checks.items() if k != "db"):
        return "degraded"
    return "ok"

