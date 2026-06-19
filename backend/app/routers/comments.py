from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/comments", tags=["Comments"])

@router.get("/song/{song_id}", response_model=List[schemas.CommentResponse])
def get_comments(song_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(models.Comment).filter(
        models.Comment.song_id == song_id
    ).order_by(models.Comment.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/song/{song_id}", response_model=schemas.CommentResponse, status_code=201)
def create_comment(
    song_id: int,
    comment: schemas.CommentCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    db_comment = models.Comment(
        user_id=current_user.id,
        song_id=song_id,
        content=comment.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment