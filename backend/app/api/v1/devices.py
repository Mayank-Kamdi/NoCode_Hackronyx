from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import datetime
import random

from app.core.database import get_db
from app.models.device import EdgeDevice
from app.models.incident import Incident
from app.models.camera import Camera
from app.schemas.schemas import EdgeDeviceOut, ThreatSimulationRequest
from app.ai.video_synth import video_synth
from app.ai.risk_engine import risk_engine
from app.websockets.manager import ws_manager

router = APIRouter()

@router.get("", response_model=List[EdgeDeviceOut])
def get_edge_devices(db: Session = Depends(get_db)):
    devices = db.query(EdgeDevice).all()
    return devices

@router.post("/simulate-threat")
async def trigger_threat_simulation(
    payload: ThreatSimulationRequest,
    db: Session = Depends(get_db)
):
    scenario = payload.scenario
    video_synth.set_scenario(scenario)

    # Calculate simulated risk profile
    if scenario == "NIGHT_ISOLATION":
        risk_profile = risk_engine.calculate_risk(0.92, 0.85, 0.88, 0.10, True)
    elif scenario == "DISTRESS_POSTURE":
        risk_profile = risk_engine.calculate_risk(0.80, 0.40, 0.30, 0.95, True)
    elif scenario == "SURROUNDING_CROWD":
        risk_profile = risk_engine.calculate_risk(0.85, 0.90, 0.75, 0.60, True)
    else:
        risk_profile = risk_engine.calculate_risk(0.15, 0.10, 0.05, 0.0, False)

    camera_code = payload.camera_code or "CAM-01"
    camera = db.query(Camera).filter(Camera.code == camera_code).first()
    if not camera:
        camera = db.query(Camera).first()

    camera_id = camera.id if camera else 1
    camera_name = camera.name if camera else "Sector 4 Alleyway"
    location_name = camera.location_name if camera else "North Gate, Tech Park"
    latitude = camera.latitude if camera else 21.1458
    longitude = camera.longitude if camera else 79.0882

    created_incident = None
    # If threat risk score > 40, auto create incident and broadcast alert
    if risk_profile["risk_score"] > 35:
        inc_code = f"INC-{random.randint(1000, 9999)}"
        inc = Incident(
            incident_code=inc_code,
            camera_id=camera_id,
            threat_level=risk_profile["threat_level"],
            risk_score=risk_profile["risk_score"],
            status="TRIGGERED",
            detected_factors=", ".join(risk_profile["detected_factors"]),
            snapshot_url=f"/api/v1/stream/snapshot/{camera_id}",
            timestamp=datetime.datetime.utcnow()
        )
        db.add(inc)
        db.commit()
        db.refresh(inc)
        created_incident = inc

        # WebSocket real-time broadcast payload
        alert_event = {
            "type": "NEW_THREAT_ALERT",
            "incident_id": inc.id,
            "incident_code": inc.incident_code,
            "camera_id": camera_id,
            "camera_name": camera_name,
            "location_name": location_name,
            "latitude": latitude,
            "longitude": longitude,
            "threat_level": inc.threat_level,
            "risk_score": inc.risk_score,
            "factors": risk_profile["detected_factors"],
            "timestamp": inc.timestamp.isoformat()
        }
        await ws_manager.broadcast(alert_event)

    return {
        "status": "SUCCESS",
        "active_scenario": scenario,
        "risk_profile": risk_profile,
        "created_incident_id": created_incident.id if created_incident else None
    }
