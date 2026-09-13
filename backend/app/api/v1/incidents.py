from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from app.core.database import get_db
from app.models.incident import Incident
from app.models.camera import Camera
from app.schemas.schemas import IncidentOut, IncidentAction
from app.websockets.manager import ws_manager

router = APIRouter()

@router.get("", response_model=List[IncidentOut])
def list_incidents(
    status: Optional[str] = None,
    threat_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident).join(Camera)
    if status:
        query = query.filter(Incident.status == status)
    if threat_level:
        query = query.filter(Incident.threat_level == threat_level)
    
    incidents = query.order_by(Incident.timestamp.desc()).all()
    
    results = []
    for inc in incidents:
        inc_dict = {
            "id": inc.id,
            "incident_code": inc.incident_code,
            "camera_id": inc.camera_id,
            "threat_level": inc.threat_level,
            "risk_score": inc.risk_score,
            "status": inc.status,
            "detected_factors": inc.detected_factors,
            "bounding_boxes": inc.bounding_boxes,
            "snapshot_url": inc.snapshot_url,
            "notes": inc.notes,
            "timestamp": inc.timestamp,
            "acknowledged_at": inc.acknowledged_at,
            "acknowledged_by": inc.acknowledged_by,
            "resolved_at": inc.resolved_at,
            "resolved_by": inc.resolved_by,
            "camera_name": inc.camera.name if inc.camera else "Unknown",
            "location_name": inc.camera.location_name if inc.camera else "Unknown",
            "latitude": inc.camera.latitude if inc.camera else 21.1458,
            "longitude": inc.camera.longitude if inc.camera else 79.0882,
        }
        results.append(inc_dict)
    return results

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return {
        "id": inc.id,
        "incident_code": inc.incident_code,
        "camera_id": inc.camera_id,
        "threat_level": inc.threat_level,
        "risk_score": inc.risk_score,
        "status": inc.status,
        "detected_factors": inc.detected_factors,
        "bounding_boxes": inc.bounding_boxes,
        "snapshot_url": inc.snapshot_url,
        "notes": inc.notes,
        "timestamp": inc.timestamp,
        "acknowledged_at": inc.acknowledged_at,
        "acknowledged_by": inc.acknowledged_by,
        "resolved_at": inc.resolved_at,
        "resolved_by": inc.resolved_by,
        "camera_name": inc.camera.name if inc.camera else "Unknown",
        "location_name": inc.camera.location_name if inc.camera else "Unknown",
        "latitude": inc.camera.latitude if inc.camera else 21.1458,
        "longitude": inc.camera.longitude if inc.camera else 79.0882,
    }

@router.post("/{incident_id}/action", response_model=IncidentOut)
async def update_incident_status(
    incident_id: int,
    action: IncidentAction,
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    inc.status = action.status
    if action.notes:
        inc.notes = (inc.notes or "") + f"\n[{action.by_user}]: {action.notes}"

    now = datetime.datetime.utcnow()
    if action.status == "ACKNOWLEDGED":
        inc.acknowledged_at = now
        inc.acknowledged_by = action.by_user
    elif action.status in ["RESOLVED", "FALSE_ALARM"]:
        inc.resolved_at = now
        inc.resolved_by = action.by_user

    db.commit()
    db.refresh(inc)

    # Broadcast real-time status update to all connected web clients
    payload = {
        "type": "INCIDENT_STATUS_UPDATE",
        "incident_id": inc.id,
        "incident_code": inc.incident_code,
        "status": inc.status,
        "by_user": action.by_user,
        "timestamp": now.isoformat()
    }
    await ws_manager.broadcast(payload)

    return get_incident(incident_id, db)
