from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, auth

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/top-songs")
def top_songs(limit: int = 10, db: Session = Depends(get_db)):
    songs = db.query(models.Song).filter(
        models.Song.is_approved == True
    ).order_by(models.Song.play_count.desc()).limit(limit).all()
    return songs

@router.get("/top-artists")
def top_artists(limit: int = 10, db: Session = Depends(get_db)):
    artists = db.query(models.Artist).filter(
        models.Artist.is_approved == True
    ).order_by(models.Artist.total_streams.desc()).limit(limit).all()
    return artists