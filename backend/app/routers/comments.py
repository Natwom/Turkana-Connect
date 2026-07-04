from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/comments", tags=["Comments"])

@router.get("/song/{song_id}", response_model=List[schemas.CommentResponse])
def get_comments(song_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    comments = db.query(models.Comment).filter(
        models.Comment.song_id == song_id
    ).order_by(models.Comment.created_at.desc()).offset(skip).limit(limit).all()
    return comments

@router.post("/song/{song_id}", response_model=schemas.CommentResponse, status_code=201)
def create_comment(
    song_id: int,
    comment: schemas.CommentCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify song exists
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Song not found")
    
    db_comment = models.Comment(
        user_id=current_user.id,
        song_id=song_id,
        content=comment.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return db_comment

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(404, "Comment not found")
    
    # Only comment owner or admin can delete
    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "Not authorized to delete this comment")
    
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}