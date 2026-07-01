from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/likes", tags=["Likes"])

@router.get("/my/count")
def get_my_likes_count(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get total liked songs count for current user"""
    count = db.query(func.count(models.Like.id)).filter(
        models.Like.user_id == current_user.id
    ).scalar() or 0
    return {"count": count}

@router.get("/my")
def get_my_liked_songs(
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all liked songs for current user"""
    likes = db.query(models.Like, models.Song, models.Artist).\
        join(models.Song, models.Like.song_id == models.Song.id).\
        join(models.Artist, models.Song.artist_id == models.Artist.id).\
        filter(models.Like.user_id == current_user.id).\
        order_by(models.Like.created_at.desc()).\
        offset(skip).limit(limit).\
        all()
    
    result = []
    for like, song, artist in likes:
        result.append({
            "id": song.id,
            "title": song.title,
            "artist_name": artist.stage_name,
            "artist_id": artist.id,
            "cover_url": song.cover_url,
            "duration": song.duration,
            "liked_at": like.created_at.isoformat() if like.created_at else None
        })
    
    return result

@router.post("/{song_id}")
def like_song(
    song_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Like).filter(
        models.Like.user_id == current_user.id,
        models.Like.song_id == song_id
    ).first()
    if existing:
        raise HTTPException(400, "Already liked")
    
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Song not found")
    
    like = models.Like(user_id=current_user.id, song_id=song_id)
    song.likes_count += 1
    db.add(like)
    db.commit()
    return {"message": "Liked"}

@router.delete("/{song_id}")
def unlike_song(
    song_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    like = db.query(models.Like).filter(
        models.Like.user_id == current_user.id,
        models.Like.song_id == song_id
    ).first()
    if not like:
        raise HTTPException(400, "Not liked")
    
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    song.likes_count -= 1
    db.delete(like)
    db.commit()
    return {"message": "Unliked"}