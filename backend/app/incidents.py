from sqlalchemy.orm import Session
from .models_incident import Incident

ALLOWED_SEVERITIES = {"warning", "error", "critical"}

def create_incident(
    db: Session,
    component: str,
    severity: str,
    message: str,
    error: str = ""
):
    if severity not in ALLOWED_SEVERITIES:
        severity = "error"

    incident = Incident(
        component=component,
        severity=severity,
        message=message,
        error=error[:4000]  # avoid huge blobs in sqlite
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

