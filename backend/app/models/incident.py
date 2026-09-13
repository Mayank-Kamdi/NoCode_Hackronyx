from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String, unique=True, index=True, nullable=False)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    threat_level = Column(String, nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Float, nullable=False) # 0 to 100
    status = Column(String, default="TRIGGERED") # TRIGGERED, ACKNOWLEDGED, RESPONDING, RESOLVED, FALSE_ALARM
    
    detected_factors = Column(Text, nullable=True) # JSON formatted factors e.g. ["Isolated Individual", "Pursuit Motion Vector", "Surrounding Encroachment"]
    bounding_boxes = Column(Text, nullable=True) # JSON formatted bounding boxes
    snapshot_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)

    camera = relationship("Camera", backref="incidents")
