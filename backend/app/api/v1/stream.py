from fastapi import APIRouter
from fastapi.responses import StreamingResponse, Response
import time
from app.ai.video_synth import video_synth

router = APIRouter()

def mjpeg_generator(camera_id: int):
    while True:
        frame_bytes, _ = video_synth.generate_frame(f"CAM-{camera_id:02d}")
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.04) # ~25 FPS

@router.get("/{camera_id}")
def stream_camera_feed(camera_id: int):
    return StreamingResponse(
        mjpeg_generator(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.get("/snapshot/{camera_id}")
def get_snapshot(camera_id: int):
    frame_bytes, _ = video_synth.generate_frame(f"CAM-{camera_id:02d}")
    return Response(content=frame_bytes, media_type="image/jpeg")
