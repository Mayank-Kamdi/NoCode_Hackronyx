from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.incident import Incident
from app.models.camera import Camera
from app.models.device import EdgeDevice

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    total_cameras = db.query(Camera).count()
    online_cameras = db.query(Camera).filter(Camera.status == "ONLINE").count()
    
    total_incidents = db.query(Incident).count()
    active_critical = db.query(Incident).filter(
        Incident.threat_level == "CRITICAL",
        Incident.status.in_(["TRIGGERED", "ACKNOWLEDGED", "RESPONDING"])
    ).count()

    active_high = db.query(Incident).filter(
        Incident.threat_level == "HIGH",
        Incident.status.in_(["TRIGGERED", "ACKNOWLEDGED", "RESPONDING"])
    ).count()

    total_devices = db.query(EdgeDevice).count()

    # Hourly distribution mock/aggregated data for Recharts UI
    hourly_distribution = [
        {"hour": "00:00", "critical": 4, "high": 7, "medium": 12},
        {"hour": "02:00", "critical": 6, "high": 9, "medium": 15},
        {"hour": "04:00", "critical": 3, "high": 5, "medium": 8},
        {"hour": "06:00", "critical": 1, "high": 2, "medium": 4},
        {"hour": "08:00", "critical": 0, "high": 1, "medium": 3},
        {"hour": "10:00", "critical": 0, "high": 2, "medium": 5},
        {"hour": "12:00", "critical": 1, "high": 1, "medium": 4},
        {"hour": "14:00", "critical": 0, "high": 3, "medium": 6},
        {"hour": "16:00", "critical": 2, "high": 4, "medium": 8},
        {"hour": "18:00", "critical": 3, "high": 6, "medium": 11},
        {"hour": "20:00", "critical": 5, "high": 10, "medium": 18},
        {"hour": "22:00", "critical": 8, "high": 14, "medium": 22},
    ]

    # Threat factors breakdown
    factors_breakdown = [
        {"name": "Isolated Individual at Night", "value": 42},
        {"name": "Co-aligned Pursuit Motion", "value": 28},
        {"name": "Rapid Proximity Encroachment", "value": 18},
        {"name": "Distress Gesture Identified", "value": 12},
    ]

    return {
        "metrics": {
            "total_cameras": total_cameras,
            "online_cameras": online_cameras,
            "total_incidents": total_incidents,
            "active_critical_threats": active_critical,
            "active_high_threats": active_high,
            "avg_response_time_seconds": 48.5,
            "edge_devices_active": total_devices,
            "ai_accuracy_percent": 96.4
        },
        "hourly_distribution": hourly_distribution,
        "factors_breakdown": factors_breakdown
    }
