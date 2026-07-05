from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import uuid
from datetime import datetime

from app.database import get_db
from app.auth import get_current_user, get_current_active_user
from app import models, schemas
from app.config import settings

router = APIRouter(prefix="/live", tags=["Live Streaming"])

def generate_stream_key():
    return str(uuid.uuid4()).replace("-", "")[:24]

def get_rtmp_url(stream_key: str):
    base = getattr(settings, "RTMP_BASE_URL", "rtmp://localhost:1935/live")
    return f"{base}/{stream_key}"

def get_hls_url(stream_key: str):
    base = getattr(settings, "HLS_BASE_URL", "http://localhost:8080/live")
    return f"{base}/{stream_key}.m3u8"

def get_ws_url():
    base = getattr(settings, "WS_BASE_URL", "ws://localhost:8000")
    return base

@router.get("/streams", response_model=List[schemas.LiveStreamResponse])
def get_live_streams(
    status: Optional[str] = Query("live", description="Filter by status: live, scheduled, ended, all"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(models.LiveStream).options(joinedload(models.LiveStream.artist))
    
    if status != "all":
        query = query.filter(models.LiveStream.status == status)
    
    streams = query.filter(models.LiveStream.is_public == True).order_by(models.LiveStream.started_at.desc()).offset(offset).limit(limit).all()
    
    for stream in streams:
        stream.current_viewers = db.query(models.LiveViewer).filter(
            models.LiveViewer.stream_id == stream.id,
            models.LiveViewer.left_at.is_(None)
        ).count()
    
    return streams

@router.get("/streams/active", response_model=List[schemas.LiveStreamResponse])
def get_active_streams(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    streams = db.query(models.LiveStream).options(joinedload(models.LiveStream.artist)).filter(
        models.LiveStream.status == "live",
        models.LiveStream.is_public == True
    ).order_by(models.LiveStream.started_at.desc()).limit(limit).all()
    
    for stream in streams:
        stream.current_viewers = db.query(models.LiveViewer).filter(
            models.LiveViewer.stream_id == stream.id,
            models.LiveViewer.left_at.is_(None)
        ).count()
    
    return streams

@router.get("/streams/{stream_id}", response_model=schemas.LiveStreamDetail)
def get_stream_detail(
    stream_id: int,
    db: Session = Depends(get_db)
):
    stream = db.query(models.LiveStream).options(
        joinedload(models.LiveStream.artist),
        joinedload(models.LiveStream.chat_messages).joinedload(models.LiveChatMessage.user)
    ).filter(models.LiveStream.id == stream_id).first()
    
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    stream.current_viewers = db.query(models.LiveViewer).filter(
        models.LiveViewer.stream_id == stream.id,
        models.LiveViewer.left_at.is_(None)
    ).count()
    
    return stream

@router.post("/streams", response_model=schemas.LiveStreamResponse, status_code=status.HTTP_201_CREATED)
def create_stream(
    stream_data: schemas.LiveStreamCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["artist", "admin"]:
        raise HTTPException(status_code=403, detail="Only artists can create streams")
    
    artist = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist profile not found")
    
    stream_key = generate_stream_key()
    
    db_stream = models.LiveStream(
        artist_id=artist.id,
        title=stream_data.title,
        description=stream_data.description,
        stream_key=stream_key,
        rtmp_url=get_rtmp_url(stream_key),
        hls_url=get_hls_url(stream_key),
        scheduled_at=stream_data.scheduled_at,
        is_public=stream_data.is_public,
        chat_enabled=stream_data.chat_enabled,
        status="scheduled"
    )
    db.add(db_stream)
    db.commit()
    db.refresh(db_stream)
    
    db_stream.current_viewers = 0
    db_stream.artist = artist
    
    return db_stream

@router.post("/streams/{stream_id}/start", response_model=schemas.LiveStreamStartResponse)
def start_stream(
    stream_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    stream = db.query(models.LiveStream).filter(models.LiveStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    artist = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if not artist or stream.artist_id != artist.id:
        raise HTTPException(status_code=403, detail="You can only start your own streams")
    
    stream.status = "live"
    stream.started_at = datetime.utcnow()
    db.commit()
    db.refresh(stream)
    
    return schemas.LiveStreamStartResponse(
        stream_id=stream.id,
        stream_key=stream.stream_key,
        rtmp_url=stream.rtmp_url,
        hls_url=stream.hls_url,
        websocket_url=f"{get_ws_url()}/api/v1/ws/live/{stream.id}",
        status="live"
    )

@router.post("/streams/{stream_id}/end", response_model=schemas.LiveStreamEndResponse)
def end_stream(
    stream_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    stream = db.query(models.LiveStream).filter(models.LiveStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    artist = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if not artist or stream.artist_id != artist.id:
        raise HTTPException(status_code=403, detail="You can only end your own streams")
    
    stream.status = "ended"
    stream.ended_at = datetime.utcnow()
    
    db.query(models.LiveViewer).filter(
        models.LiveViewer.stream_id == stream.id,
        models.LiveViewer.left_at.is_(None)
    ).update({"left_at": datetime.utcnow()})
    
    duration = 0
    if stream.started_at:
        duration = int((stream.ended_at - stream.started_at).total_seconds())
    
    total_viewers = db.query(models.LiveViewer).filter(models.LiveViewer.stream_id == stream.id).count()
    max_viewers = stream.max_viewers or 0
    
    db.commit()
    db.refresh(stream)
    
    return schemas.LiveStreamEndResponse(
        stream_id=stream.id,
        status="ended",
        duration_seconds=duration,
        total_viewers=total_viewers,
        max_viewers=max_viewers
    )

@router.post("/streams/{stream_id}/join")
def join_stream(
    stream_id: int,
    session_id: str = Query(..., description="Client session ID"),
    current_user: Optional[models.User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stream = db.query(models.LiveStream).filter(models.LiveStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    if stream.status != "live":
        raise HTTPException(status_code=400, detail="Stream is not live")
    
    existing = db.query(models.LiveViewer).filter(
        models.LiveViewer.stream_id == stream_id,
        models.LiveViewer.session_id == session_id,
        models.LiveViewer.left_at.is_(None)
    ).first()
    
    if not existing:
        viewer = models.LiveViewer(
            stream_id=stream_id,
            user_id=current_user.id if current_user else None,
            session_id=session_id
        )
        db.add(viewer)
        stream.total_viewers = (stream.total_viewers or 0) + 1
        
        current_count = db.query(models.LiveViewer).filter(
            models.LiveViewer.stream_id == stream_id,
            models.LiveViewer.left_at.is_(None)
        ).count() + 1
        
        if current_count > (stream.max_viewers or 0):
            stream.max_viewers = current_count
        
        db.commit()
    
    return {"status": "joined", "stream_id": stream_id, "hls_url": stream.hls_url}

@router.post("/streams/{stream_id}/leave")
def leave_stream(
    stream_id: int,
    session_id: str = Query(..., description="Client session ID"),
    db: Session = Depends(get_db)
):
    viewer = db.query(models.LiveViewer).filter(
        models.LiveViewer.stream_id == stream_id,
        models.LiveViewer.session_id == session_id,
        models.LiveViewer.left_at.is_(None)
    ).first()
    
    if viewer:
        viewer.left_at = datetime.utcnow()
        db.commit()
    
    return {"status": "left", "stream_id": stream_id}

@router.get("/streams/{stream_id}/viewers")
def get_stream_viewers(
    stream_id: int,
    db: Session = Depends(get_db)
):
    stream = db.query(models.LiveStream).filter(models.LiveStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    current = db.query(models.LiveViewer).filter(
        models.LiveViewer.stream_id == stream_id,
        models.LiveViewer.left_at.is_(None)
    ).count()
    
    return {
        "stream_id": stream_id,
        "current_viewers": current,
        "total_viewers": stream.total_viewers or 0,
        "max_viewers": stream.max_viewers or 0
    }

@router.get("/my-streams", response_model=List[schemas.LiveStreamResponse])
def get_my_streams(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["artist", "admin"]:
        raise HTTPException(status_code=403, detail="Only artists can view their streams")
    
    artist = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist profile not found")
    
    streams = db.query(models.LiveStream).options(joinedload(models.LiveStream.artist)).filter(
        models.LiveStream.artist_id == artist.id
    ).order_by(models.LiveStream.created_at.desc()).all()
    
    for stream in streams:
        stream.current_viewers = db.query(models.LiveViewer).filter(
            models.LiveViewer.stream_id == stream.id,
            models.LiveViewer.left_at.is_(None)
        ).count()
    
    return streams

@router.delete("/streams/{stream_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stream(
    stream_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    stream = db.query(models.LiveStream).filter(models.LiveStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    artist = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if not artist or stream.artist_id != artist.id:
        raise HTTPException(status_code=403, detail="You can only delete your own streams")
    
    db.delete(stream)
    db.commit()
    return None