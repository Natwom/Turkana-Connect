from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/playlists", tags=["Playlists"])

@router.get("/", response_model=List[schemas.PlaylistResponse])
def list_playlists(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.Playlist).filter(models.Playlist.is_public == True).offset(skip).limit(limit).all()

@router.get("/my")
def get_my_playlists(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's playlists with song count"""
    playlists = db.query(models.Playlist).\
        filter(models.Playlist.user_id == current_user.id).\
        order_by(models.Playlist.created_at.desc()).\
        all()
    
    result = []
    for playlist in playlists:
        result.append({
            "id": playlist.id,
            "name": playlist.name,
            "cover_url": playlist.cover_url,
            "is_public": playlist.is_public,
            "song_count": len(playlist.songs),
            "created_at": playlist.created_at.isoformat() if playlist.created_at else None
        })
    
    return result

@router.get("/my/count")
def get_my_playlists_count(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get total playlists count for current user"""
    count = db.query(func.count(models.Playlist.id)).filter(
        models.Playlist.user_id == current_user.id
    ).scalar() or 0
    return {"count": count}

@router.post("/", response_model=schemas.PlaylistResponse, status_code=201)
def create_playlist(
    playlist: schemas.PlaylistCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    db_playlist = models.Playlist(user_id=current_user.id, **playlist.model_dump())
    db.add(db_playlist)
    db.commit()
    db.refresh(db_playlist)
    return db_playlist

@router.get("/{playlist_id}", response_model=schemas.PlaylistDetail)
def get_playlist(playlist_id: int, db: Session = Depends(get_db)):
    playlist = db.query(models.Playlist).filter(models.Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(404, "Playlist not found")
    return playlist

@router.post("/{playlist_id}/songs/{song_id}")
def add_song_to_playlist(
    playlist_id: int,
    song_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    playlist = db.query(models.Playlist).filter(
        models.Playlist.id == playlist_id,
        models.Playlist.user_id == current_user.id
    ).first()
    if not playlist:
        raise HTTPException(404, "Playlist not found")
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Song not found")
    playlist.songs.append(song)
    db.commit()
    return {"message": "Song added to playlist"}