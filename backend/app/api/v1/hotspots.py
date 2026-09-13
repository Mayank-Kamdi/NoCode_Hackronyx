from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.device import HotspotZone
from app.schemas.schemas import HotspotOut

router = APIRouter()

@router.get("", response_model=List[HotspotOut])
def get_hotspots(db: Session = Depends(get_db)):
    hotspots = db.query(HotspotZone).all()
    return hotspots
