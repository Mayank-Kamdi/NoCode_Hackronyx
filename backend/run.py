import uvicorn
import datetime
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User
from app.models.camera import Camera
from app.models.incident import Incident
from app.models.device import EdgeDevice, HotspotZone

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if database is already seeded
    if db.query(User).first() is not None:
        db.close()
        return

    print("Seeding initial database with ABHAYA hackathon demo dataset...")

    # 1. Create Default Users (ADMIN, SECURITY, AI_EDGE_DEVICE)
    admin_user = User(
        username="admin",
        email="admin@abhaya.gov.in",
        hashed_password=hash_password("admin123"),
        role="ADMIN",
        full_name="Command Chief R. Sharma",
        badge_id="ADM-8801",
        assigned_zone="HQ Surveillance Desk"
    )

    security_user = User(
        username="security",
        email="security@abhaya.gov.in",
        hashed_password=hash_password("sec123"),
        role="SECURITY",
        full_name="Inspector Vikram Singh",
        badge_id="SEC-4092",
        assigned_zone="Sector 4 - Tech Park"
    )

    edge_user = User(
        username="edge_node_01",
        email="edge01@abhaya.gov.in",
        hashed_password=hash_password("edge123"),
        role="AI_EDGE_DEVICE",
        full_name="Edge Device Node #01",
        badge_id="EDGE-001",
        assigned_zone="North Gate Perimeter"
    )

    db.add_all([admin_user, security_user, edge_user])
    db.commit()

    # 2. Create Cameras
    cam1 = Camera(
        name="Sector 4 Alleyway Cam #01",
        code="CAM-01",
        location_name="North Gate Alleyway, Cyber City",
        zone="Sector 4",
        latitude=21.1458,
        longitude=79.0882,
        status="ONLINE",
        resolution="1080p",
        fps=30
    )
    cam2 = Camera(
        name="Metro Corridor Cam #02",
        code="CAM-02",
        location_name="Subway Station Exit 3, Sector 4",
        zone="Sector 4",
        latitude=28.6180,
        longitude=77.2140,
        status="ONLINE",
        resolution="4K",
        fps=60
    )
    cam3 = Camera(
        name="Bus Stop Bay #04",
        code="CAM-03",
        location_name="Outer Ring Road Transit Point",
        zone="Sector 8",
        latitude=28.6080,
        longitude=77.2010,
        status="ONLINE",
        resolution="1080p",
        fps=30
    )
    cam4 = Camera(
        name="Tech Park Backgate Cam #04",
        code="CAM-04",
        location_name="Industrial Promenade Lane B",
        zone="Sector 4",
        latitude=28.6155,
        longitude=77.2185,
        status="DEGRADED",
        resolution="720p",
        fps=15
    )

    db.add_all([cam1, cam2, cam3, cam4])
    db.commit()

    # 3. Create Edge Devices
    dev1 = EdgeDevice(
        device_code="EDGE-JETSON-01",
        name="NVIDIA Jetson Orin AGX #1",
        camera_id=1,
        ip_address="192.168.1.104",
        status="ONLINE",
        firmware_version="v2.4.1-edge-cuda",
        cpu_usage=28.4,
        gpu_usage=64.2,
        temperature_c=54.5,
        inference_fps=29.8
    )
    dev2 = EdgeDevice(
        device_code="EDGE-JETSON-02",
        name="NVIDIA Jetson Xavier NX #2",
        camera_id=2,
        ip_address="192.168.1.105",
        status="ONLINE",
        firmware_version="v2.4.1-edge-cuda",
        cpu_usage=38.1,
        gpu_usage=72.0,
        temperature_c=61.0,
        inference_fps=30.0
    )
    db.add_all([dev1, dev2])

    # 4. Create Hotspot Zones
    zone1 = HotspotZone(
        zone_name="Sector 4 Night Corridor",
        center_lat=28.6145,
        center_lng=77.2100,
        radius_meters=300.0,
        risk_level="HIGH",
        incidents_count=14
    )
    zone2 = HotspotZone(
        zone_name="Subway Exit Secluded Walkway",
        center_lat=28.6185,
        center_lng=77.2145,
        radius_meters=200.0,
        risk_level="CRITICAL",
        incidents_count=22
    )
    zone3 = HotspotZone(
        zone_name="Central Tech Plaza Main Square",
        center_lat=28.6100,
        center_lng=77.2050,
        radius_meters=400.0,
        risk_level="LOW",
        incidents_count=2
    )
    db.add_all([zone1, zone2, zone3])

    # 5. Create Initial Historical Incidents
    inc1 = Incident(
        incident_code="INC-8921",
        camera_id=1,
        threat_level="CRITICAL",
        risk_score=94.5,
        status="TRIGGERED",
        detected_factors="Isolated Woman Detected, Co-aligned Pursuit Motion Vector, Rapid Unsanctioned Proximity Encroachment",
        snapshot_url="/api/v1/stream/snapshot/1",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=4)
    )
    inc2 = Incident(
        incident_code="INC-8890",
        camera_id=2,
        threat_level="HIGH",
        risk_score=78.0,
        status="RESPONDING",
        detected_factors="Distress Posture Identified (Hands Up / Rapid Stance Shift)",
        snapshot_url="/api/v1/stream/snapshot/2",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=24),
        acknowledged_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=22),
        acknowledged_by="Inspector Vikram Singh"
    )
    inc3 = Incident(
        incident_code="INC-8742",
        camera_id=3,
        threat_level="MEDIUM",
        risk_score=52.0,
        status="RESOLVED",
        detected_factors="Surrounding Encroachment in Secluded Bus Bay",
        snapshot_url="/api/v1/stream/snapshot/3",
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=3),
        acknowledged_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=55),
        acknowledged_by="Inspector Vikram Singh",
        resolved_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2, minutes=30),
        resolved_by="Inspector Vikram Singh",
        notes="Security patrol dispatched. Verified safe escort provided."
    )

    db.add_all([inc1, inc2, inc3])
    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    from app.main import app
    seed_db()
    uvicorn.run(app, host="0.0.0.0", port=8000)
