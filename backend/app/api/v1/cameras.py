from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.camera import Camera
from app.schemas.schemas import CameraOut

router = APIRouter()

@router.get("", response_model=List[CameraOut])
def list_cameras(db: Session = Depends(get_db)):
    cameras = db.query(Camera).all()
    return cameras

@router.get("/{camera_id}", response_model=CameraOut)
def get_camera(camera_id: int, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera
