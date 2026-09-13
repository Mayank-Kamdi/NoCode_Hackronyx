from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import datetime
import random
import logging

from app.core.database import get_db
from app.core.config import settings
from app.models.incident import Incident
from app.models.camera import Camera
from app.websockets.manager import ws_manager
from app.services.twilio_service import twilio_service
from app.services.telegram_service import telegram_service

logger = logging.getLogger("abhaya_alerts")

router = APIRouter()

class DeviceAlertPayload(BaseModel):
    device_id: str = "PHONE-001"
    user_name: Optional[str] = "Priya Sharma"
    alert_id: Optional[str] = None
    alert_type: str = "SOS"
    latitude: Optional[float] = 0.0
    longitude: Optional[float] = 0.0
    accuracy: Optional[float] = 0.0
    timestamp: Optional[str] = None
    message: str = "Emergency SOS alert"
    
    # Backwards compatibility / optional fields
    location: Optional[str] = "Live GPS Location"
    risk_score: Optional[float] = 95.0
    severity: Optional[str] = "CRITICAL"
    recipient_phone: Optional[str] = None

class TestTwilioPayload(BaseModel):
    recipient_phone: str = "+919373156804"
    officer_phone: str = "+917058943223"
    message: str = "Emergency Test Alert from ABHAYA Women Safety Platform"

@router.post("/alert")
async def receive_device_alert(payload: DeviceAlertPayload, db: Session = Depends(get_db)):
    if payload.alert_id:
        alert_id = payload.alert_id
    else:
        max_id = db.query(Incident).count()
        alert_id = f"ABH-SOS-{(max_id + random.randint(100, 900)):03d}"

    now_str = payload.timestamp or (datetime.datetime.utcnow().isoformat() + "Z")
    lat_val = payload.latitude if payload.latitude is not None else 0.0
    lng_val = payload.longitude if payload.longitude is not None else 0.0
    sender_name = payload.user_name or "Priya Sharma"

    print("\n==========================================")
    print("[SOS RECEIVED]")
    print(f"User Name:\n{sender_name}")
    print(f"Device:\n{payload.device_id}")
    print(f"Location:\n{lat_val}, {lng_val}")
    print(f"Accuracy:\n{payload.accuracy} meters")
    print("[BROADCASTING ALERT]")
    print("[ALERT DELIVERED]")
    print("==========================================\n")

    # Save to Database
    camera = db.query(Camera).first()
    camera_id = camera.id if camera else 1

    existing_inc = db.query(Incident).filter(Incident.incident_code == alert_id).first()
    if not existing_inc:
        new_incident = Incident(
            incident_code=alert_id,
            camera_id=camera_id,
            threat_level="CRITICAL",
            risk_score=95.0,
            status="DETECTED",
            detected_factors=f"{sender_name}: {payload.message}",
            snapshot_url=f"/api/v1/stream/snapshot/{camera_id}",
            timestamp=datetime.datetime.utcnow()
        )
        db.add(new_incident)
        db.commit()

    # Twilio Notifications
    sms_res = twilio_service.send_emergency_sms(
        event_id=alert_id,
        device_id=payload.device_id,
        location=f"{lat_val:.4f}, {lng_val:.4f}",
        risk_score=95.0,
        severity="CRITICAL",
        message_body=f"SOS Triggered by {sender_name}",
        user_number=payload.recipient_phone or settings.USER_EMERGENCY_PHONE,
        officer_number=settings.SECURITY_OFFICER_PHONE,
        latitude=lat_val,
        longitude=lng_val
    )

    # 100% Free Telegram Bot Alert Dispatch
    telegram_res = telegram_service.send_emergency_alert(
        event_id=alert_id,
        device_id=payload.device_id,
        user_name=sender_name,
        user_phone=settings.USER_EMERGENCY_PHONE,
        latitude=lat_val,
        longitude=lng_val,
        message_body=payload.message
    )

    # Real-Time WebSocket Broadcast Payload
    alert_ws_event = {
        "type": "NEW_SECURITY_ALERT",
        "alert_id": alert_id,
        "event_id": alert_id,
        "alert_type": payload.alert_type,
        "device_id": payload.device_id,
        "user_name": sender_name,
        "latitude": lat_val,
        "longitude": lng_val,
        "accuracy": payload.accuracy,
        "location": f"{lat_val:.4f}, {lng_val:.4f}",
        "risk_score": 95.0,
        "severity": "CRITICAL",
        "message": f"Emergency SOS alert triggered by {sender_name}",
        "status": "DETECTED",
        "timestamp": now_str,
        "user_phone": settings.USER_EMERGENCY_PHONE,
        "officer_phone": settings.SECURITY_OFFICER_PHONE,
        "sms_status": sms_res,
        "telegram_status": telegram_res
    }

    await ws_manager.broadcast(alert_ws_event)

    return {
        "success": True,
        "alert_id": alert_id,
        "event_id": alert_id,
        "user_name": sender_name,
        "telegram_status": telegram_res,
        "message": "SOS alert dispatched"
    }

@router.post("/alert/{event_id}/acknowledge")
async def acknowledge_alert(event_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(
        (Incident.incident_code == event_id) | (Incident.id == (int(event_id) if event_id.isdigit() else -1))
    ).first()

    now = datetime.datetime.utcnow()
    now_str = now.isoformat() + "Z"

    if inc:
        inc.status = "ACKNOWLEDGED"
        inc.acknowledged_at = now
        inc.acknowledged_by = f"Security Officer (+917058943223)"
        db.commit()
        target_code = inc.incident_code
    else:
        target_code = event_id

    print(f"\n[ALERT ACKNOWLEDGED] Alert ID: {target_code} by Security Officer (+917058943223)\n")

    ws_update = {
        "type": "ALERT_STATUS_UPDATE",
        "alert_id": target_code,
        "event_id": target_code,
        "status": "ACKNOWLEDGED",
        "timestamp": now_str,
        "acknowledged_by_officer": "+917058943223"
    }
    await ws_manager.broadcast(ws_update)

    return {
        "success": True,
        "alert_id": target_code,
        "event_id": target_code,
        "status": "ACKNOWLEDGED"
    }
