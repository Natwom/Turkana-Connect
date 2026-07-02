from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app import models, auth
from app.services.notification import NotificationService

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


@router.get("/my/ids")
def get_my_liked_song_ids(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get just the song IDs of liked songs (efficient for UI state)"""
    likes = db.query(models.Like.song_id).filter(
        models.Like.user_id == current_user.id
    ).all()
    return [like.song_id for like in likes]


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
        outerjoin(models.Artist, models.Song.artist_id == models.Artist.id).\
        filter(models.Like.user_id == current_user.id).\
        order_by(models.Like.created_at.desc()).\
        offset(skip).limit(limit).\
        all()
    
    result = []
    for like, song, artist in likes:
        result.append({
            "id": song.id,
            "title": song.title,
            "artist_name": artist.stage_name if artist else "Unknown Artist",
            "artist_id": artist.id if artist else None,
            "cover_url": song.cover_url,
            "duration": song.duration,
            "liked_at": like.created_at.isoformat() if like.created_at else None
        })
    
    return result


@router.get("/check/{song_id}")
def check_like(
    song_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check if current user liked a specific song"""
    liked = db.query(models.Like).filter(
        models.Like.user_id == current_user.id,
        models.Like.song_id == song_id
    ).first()
    return {"liked": liked is not None}


@router.post("/{song_id}")
def like_song(
    song_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Like a song"""
    existing = db.query(models.Like).filter(
        models.Like.user_id == current_user.id,
        models.Like.song_id == song_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already liked")
    
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    like = models.Like(user_id=current_user.id, song_id=song_id)
    song.likes_count += 1
    db.add(like)
    db.commit()
    db.refresh(like)
    
    # Send notification to artist
    NotificationService.create_like_notification(db, like)
    
    return {"message": "Liked", "liked": True, "song_id": song_id}


@router.delete("/{song_id}")
def unlike_song(
    song_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Unlike a song"""
    like = db.query(models.Like).filter(
        models.Like.user_id == current_user.id,
        models.Like.song_id == song_id
    ).first()
    if not like:
        raise HTTPException(status_code=400, detail="Not liked")
    
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if song:
        song.likes_count = max(0, song.likes_count - 1)
    db.delete(like)
    db.commit()
    return {"message": "Unliked", "liked": False, "song_id": song_id}