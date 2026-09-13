from pydantic import BaseModel, EmailStr
from typing import Optional, List
import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str
    full_name: Optional[str] = None
    badge_id: Optional[str] = None
    assigned_zone: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    full_name: Optional[str] = None
    badge_id: Optional[str] = None
    assigned_zone: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Camera Schemas ---
class CameraOut(BaseModel):
    id: int
    name: str
    code: str
    location_name: str
    zone: str
    latitude: float
    longitude: float
    status: str
    stream_url: Optional[str] = None
    resolution: str
    fps: int

    class Config:
        from_attributes = True

# --- Incident Schemas ---
class IncidentOut(BaseModel):
    id: int
    incident_code: str
    camera_id: int
    threat_level: str
    risk_score: float
    status: str
    detected_factors: Optional[str] = None
    bounding_boxes: Optional[str] = None
    snapshot_url: Optional[str] = None
    notes: Optional[str] = None
    timestamp: datetime.datetime
    acknowledged_at: Optional[datetime.datetime] = None
    acknowledged_by: Optional[str] = None
    resolved_at: Optional[datetime.datetime] = None
    resolved_by: Optional[str] = None
    camera_name: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True

class IncidentAction(BaseModel):
    status: str # ACKNOWLEDGED, RESPONDING, RESOLVED, FALSE_ALARM
    by_user: str
    notes: Optional[str] = None

# --- Device Schemas ---
class EdgeDeviceOut(BaseModel):
    id: int
    device_code: str
    name: str
    camera_id: Optional[int] = None
    ip_address: str
    status: str
    firmware_version: str
    cpu_usage: float
    gpu_usage: float
    temperature_c: float
    inference_fps: float
    last_heartbeat: datetime.datetime

    class Config:
        from_attributes = True

# --- Hotspot Schemas ---
class HotspotOut(BaseModel):
    id: int
    zone_name: str
    center_lat: float
    center_lng: float
    radius_meters: float
    risk_level: str
    incidents_count: int
    polygon_coordinates: Optional[str] = None

    class Config:
        from_attributes = True

# --- Threat Simulation Trigger ---
class ThreatSimulationRequest(BaseModel):
    scenario: str # "NIGHT_ISOLATION", "DISTRESS_POSTURE", "SURROUNDING_CROWD", "NORMAL"
    camera_code: Optional[str] = "CAM-01"
