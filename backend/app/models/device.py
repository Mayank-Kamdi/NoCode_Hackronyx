from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
import datetime
from app.core.database import Base

class EdgeDevice(Base):
    __tablename__ = "edge_devices"

    id = Column(Integer, primary_key=True, index=True)
    device_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=True)
    ip_address = Column(String, nullable=False)
    status = Column(String, default="ONLINE") # ONLINE, WARNING, OFFLINE
    firmware_version = Column(String, default="v2.4.1-edge")
    cpu_usage = Column(Float, default=32.5) # Percentage
    gpu_usage = Column(Float, default=45.0) # Percentage
    temperature_c = Column(Float, default=58.2) # Celsius
    inference_fps = Column(Float, default=29.4)
    last_heartbeat = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class HotspotZone(Base):
    __tablename__ = "hotspot_zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_name = Column(String, nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    radius_meters = Column(Float, default=250.0)
    risk_level = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    incidents_count = Column(Integer, default=0)
    polygon_coordinates = Column(String, nullable=True) # JSON coordinates
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
