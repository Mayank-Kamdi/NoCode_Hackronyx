from fastapi import APIRouter
from app.api.v1 import auth, cameras, incidents, analytics, hotspots, devices, stream, alerts

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(cameras.router, prefix="/cameras", tags=["Cameras"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["Incidents"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(hotspots.router, prefix="/hotspots", tags=["Hotspots"])
api_router.include_router(devices.router, prefix="/devices", tags=["Edge Devices"])
api_router.include_router(stream.router, prefix="/stream", tags=["Live Streams"])
api_router.include_router(alerts.router, tags=["Realtime Alerts"])
