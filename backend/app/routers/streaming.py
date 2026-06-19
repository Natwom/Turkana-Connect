from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, auth

router = APIRouter(prefix="/streaming", tags=["Streaming"])

@router.post("/history/{song_id}")
def record_stream(
    song_id: int,
    duration: int = 0,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    history = models.PlayHistory(
        user_id=current_user.id,
        song_id=song_id,
        duration_played=duration
    )
    db.add(history)
    db.commit()
    return {"message": "Stream recorded"}

@router.get("/history")
def get_history(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(models.PlayHistory).filter(
        models.PlayHistory.user_id == current_user.id
    ).order_by(models.PlayHistory.played_at.desc()).limit(50).all()