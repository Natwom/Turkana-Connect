from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard_stats(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_artists = db.query(models.Artist).count()
    total_songs = db.query(models.Song).count()
    total_streams = db.query(func.sum(models.Song.play_count)).scalar() or 0
    pending_approvals = db.query(models.Song).filter(models.Song.is_approved == False).count()
    pending_approvals += db.query(models.Artist).filter(models.Artist.is_approved == False).count()
    recent_reports = db.query(models.Report).filter(models.Report.status == "pending").count()
    
    return {
        "total_users": total_users,
        "total_artists": total_artists,
        "total_songs": total_songs,
        "total_streams": total_streams,
        "pending_approvals": pending_approvals,
        "recent_reports": recent_reports
    }

@router.get("/artists", response_model=List[schemas.ArtistResponse])
def list_all_artists(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(models.Artist)
    if status == "pending":
        query = query.filter(models.Artist.is_approved == False)
    elif status == "approved":
        query = query.filter(models.Artist.is_approved == True)
    return query.order_by(models.Artist.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/artists/{artist_id}/approve")
def approve_artist(artist_id: int, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    artist = db.query(models.Artist).filter(models.Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(404, "Artist not found")
    artist.is_approved = True
    db.commit()
    
    log = models.AdminLog(admin_id=current_user.id, action="approve_artist", entity_type="artist", entity_id=artist_id)
    db.add(log)
    db.commit()
    return {"message": "Artist approved"}

@router.delete("/artists/{artist_id}/reject")
def reject_artist(artist_id: int, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    artist = db.query(models.Artist).filter(models.Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(404, "Artist not found")
    
    user = db.query(models.User).filter(models.User.id == artist.user_id).first()
    if user and user.role == "artist":
        user.role = "user"
    
    log = models.AdminLog(admin_id=current_user.id, action="reject_artist", entity_type="artist", entity_id=artist_id)
    db.add(log)
    
    db.delete(artist)
    db.commit()
    return {"message": "Artist rejected and profile deleted"}

@router.get("/pending-songs", response_model=List[schemas.SongResponse])
def pending_songs(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    return db.query(models.Song).filter(models.Song.is_approved == False).all()

@router.post("/songs/{song_id}/approve")
def approve_song(song_id: int, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Song not found")
    song.is_approved = True
    db.commit()
    
    log = models.AdminLog(admin_id=current_user.id, action="approve_song", entity_type="song", entity_id=song_id)
    db.add(log)
    db.commit()
    return {"message": "Song approved"}

@router.get("/users", response_model=List[schemas.UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.User).offset(skip).limit(limit).all()

@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.id == current_user.id:
        raise HTTPException(400, "Cannot delete yourself")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.get("/reports", response_model=List[schemas.ReportResponse])
def list_reports(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    return db.query(models.Report).order_by(models.Report.created_at.desc()).all()

@router.get("/logs", response_model=List[schemas.AdminLogResponse])
def admin_logs(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.AdminLog).order_by(models.AdminLog.created_at.desc()).offset(skip).limit(limit).all()