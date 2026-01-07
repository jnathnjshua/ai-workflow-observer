from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .db import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    component = Column(String, index=True)
    severity = Column(String, index=True)
    message = Column(String)
    error = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

