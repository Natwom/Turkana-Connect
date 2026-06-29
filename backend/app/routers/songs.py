# backend/app/routers/songs.py

from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app import models, schemas, auth
from app.dependencies import save_upload_file

router = APIRouter(prefix="/songs", tags=["Songs"])

@router.get("/", response_model=List[schemas.SongResponse])
def list_songs(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    approved_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(models.Song)
    if approved_only:
        query = query.filter(models.Song.is_approved == True)
    if category:
        query = query.join(models.Category).filter(models.Category.slug == category)
    
    songs = query.order_by(models.Song.created_at.desc()).offset(skip).limit(limit).all()
    
    # Debug: print what we're returning
    print(f"Returning {len(songs)} songs")
    for s in songs:
        print(f"  Song {s.id}: title={s.title}, artist_id={s.artist_id}, audio_url={s.audio_url}")
    
    return songs