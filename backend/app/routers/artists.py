from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app import models, schemas, auth
from app.dependencies import save_upload_file

router = APIRouter(prefix="/artists", tags=["Artists"])

@router.get("/", response_model=List[schemas.ArtistResponse])
def list_artists(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.Artist).filter(models.Artist.is_approved == True).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.ArtistResponse, status_code=201)
async def create_artist(
    stage_name: str = Form(...),
    bio: Optional[str] = Form(None),
    genre: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["artist", "admin"]:
        current_user.role = "artist"
    
    existing = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if existing:
        raise HTTPException(400, "Artist profile already exists")
    
    image_url = None
    if image:
        image_url = await save_upload_file(image, "images")
    
    db_artist = models.Artist(
        user_id=current_user.id,
        stage_name=stage_name,
        bio=bio,
        genre=genre,
        image_url=image_url,
        is_approved=False
    )
    db.add(db_artist)
    db.commit()
    db.refresh(db_artist)
    return db_artist

@router.get("/{artist_id}", response_model=schemas.ArtistDetail)
def get_artist(artist_id: int, db: Session = Depends(get_db)):
    artist = db.query(models.Artist).filter(models.Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(404, "Artist not found")
    return artist

@router.post("/{artist_id}/follow")
def follow_artist(
    artist_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    artist = db.query(models.Artist).filter(models.Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(404, "Artist not found")
    
    existing = db.query(models.Follow).filter(
        models.Follow.follower_id == current_user.id,
        models.Follow.artist_id == artist_id
    ).first()
    if existing:
        raise HTTPException(400, "Already following")
    
    follow = models.Follow(follower_id=current_user.id, artist_id=artist_id)
    artist.followers_count += 1
    db.add(follow)
    db.commit()
    return {"message": "Followed successfully"}

@router.delete("/{artist_id}/follow")
def unfollow_artist(
    artist_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    follow = db.query(models.Follow).filter(
        models.Follow.follower_id == current_user.id,
        models.Follow.artist_id == artist_id
    ).first()
    if not follow:
        raise HTTPException(400, "Not following")
    
    artist = db.query(models.Artist).filter(models.Artist.id == artist_id).first()
    artist.followers_count -= 1
    db.delete(follow)
    db.commit()
    return {"message": "Unfollowed successfully"}