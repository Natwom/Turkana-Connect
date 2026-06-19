from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/albums", tags=["Albums"])

@router.get("/", response_model=List[schemas.AlbumResponse])
def list_albums(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.Album).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.AlbumResponse, status_code=201)
def create_album(
    album: schemas.AlbumCreate,
    current_user: models.User = Depends(auth.require_artist),
    db: Session = Depends(get_db)
):
    artist = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if not artist:
        raise HTTPException(403, "Artist profile required")
    db_album = models.Album(artist_id=artist.id, **album.model_dump())
    db.add(db_album)
    db.commit()
    db.refresh(db_album)
    return db_album

@router.get("/{album_id}", response_model=schemas.AlbumDetail)
def get_album(album_id: int, db: Session = Depends(get_db)):
    album = db.query(models.Album).filter(models.Album.id == album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")
    return album