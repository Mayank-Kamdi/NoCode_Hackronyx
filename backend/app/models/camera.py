from sqlalchemy import Column, Integer, String, Float, DateTime
import datetime
from app.core.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    location_name = Column(String, nullable=False)
    zone = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String, default="ONLINE") # ONLINE, OFFLINE, DEGRADED
    stream_url = Column(String, nullable=True)
    resolution = Column(String, default="1080p")
    fps = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
