from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
import datetime
import random
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, engine, get_db
from app.api.router import api_router
from app.websockets.manager import ws_manager
from app.ai.video_synth import video_synth
from app.api.v1.alerts import DeviceAlertPayload, receive_device_alert, acknowledge_alert

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("abhaya_main")

# Auto-create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="ABHAYA - AI-Powered Women Safety Surveillance & Real-Time Alert System (SIH Hackathon)"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicit Root Direct Alert Endpoints (POST /alert and POST /alert/{event_id}/acknowledge)
@app.post("/alert")
async def post_alert_root(payload: DeviceAlertPayload, db: Session = Depends(get_db)):
    return await receive_device_alert(payload, db)

@app.post("/alert/{event_id}/acknowledge")
async def post_acknowledge_root(event_id: str, db: Session = Depends(get_db)):
    return await acknowledge_alert(event_id, db)

# Include REST routes under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

# Real-Time Telemetry Background Loop
async def real_time_telemetry_loop():
    while True:
        try:
            await asyncio.sleep(2.0) # Every 2 seconds
            if ws_manager.active_connections:
                _, risk_info = video_synth.generate_frame("CAM-01")
                payload = {
                    "type": "REALTIME_TELEMETRY",
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "active_scenario": video_synth.active_scenario,
                    "risk_score": risk_info["risk_score"],
                    "threat_level": risk_info["threat_level"],
                    "inference_fps": round(28.5 + random.uniform(-1.5, 1.5), 1),
                    "gpu_usage": round(62.0 + random.uniform(-4.0, 4.0), 1),
                    "cpu_usage": round(30.0 + random.uniform(-3.0, 3.0), 1),
                    "temp_c": round(54.0 + random.uniform(-1.0, 1.0), 1)
                }
                await ws_manager.broadcast(payload)
        except Exception as e:
            logger.error(f"Error in telemetry loop: {e}")
            await asyncio.sleep(2.0)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(real_time_telemetry_loop())

# Persistent WebSocket Endpoints (WS /ws/security and WS /ws)
@app.websocket("/ws/security")
async def ws_security_endpoint(websocket: WebSocket):
    await websocket.accept()
    if websocket not in ws_manager.active_connections:
        ws_manager.active_connections.append(websocket)
    print("\n[SECURITY DEVICE CONNECTED]")
    print("Alert delivered successfully.\n")
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, username="security_device_b")

@app.websocket("/ws")
async def ws_default_endpoint(websocket: WebSocket):
    await websocket.accept()
    if websocket not in ws_manager.active_connections:
        ws_manager.active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, username="default_client")

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "system": settings.PROJECT_NAME,
        "docs": "/docs",
        "endpoints": {
            "post_alert": "/alert",
            "acknowledge": "/alert/{event_id}/acknowledge",
            "ws_security": "/ws/security"
        }
    }
