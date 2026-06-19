from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/likes", tags=["Likes"])

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