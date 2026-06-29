from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app import models, schemas, auth
from app.dependencies import save_upload_file

router = APIRouter(prefix="/artists", tags=["Artists"])

@router.get("/", response_model=List[schemas.ArtistResponse])
def list_artists(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    try:
        return db.query(models.Artist).filter(models.Artist.is_approved == True).offset(skip).limit(limit).all()
    except Exception as e:
        import traceback
        print(f"ERROR in list_artists: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.post("/", response_model=schemas.ArtistResponse, status_code=201)
async def create_artist(
    stage_name: str = Form(...),
    bio: Optional[str] = Form(None),
    genre: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    print(f"DEBUG: create_artist called by user {current_user.id} ({current_user.email}), role={current_user.role}")
    
    # Check if artist profile already exists
    existing = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if existing:
        print(f"DEBUG: Artist profile already exists for user {current_user.id}")
        raise HTTPException(400, "Artist profile already exists")
    
    # Update user role to artist
    if current_user.role not in ["artist", "admin"]:
        print(f"DEBUG: Updating user {current_user.id} role from {current_user.role} to artist")
        current_user.role = "artist"
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        print(f"DEBUG: User role updated to {current_user.role}")
    
    # Handle image upload
    image_url = None
    if image:
        try:
            print(f"DEBUG: Uploading image {image.filename}, content_type={image.content_type}")
            image_url = await save_upload_file(image, "images")
            print(f"DEBUG: Image uploaded to {image_url}")
        except HTTPException:
            raise
        except Exception as e:
            print(f"DEBUG: Image upload failed: {e}")
            import traceback
            print(traceback.format_exc())
            raise HTTPException(500, f"Image upload failed: {str(e)}")
    
    # Create artist
    try:
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
        print(f"DEBUG: Artist created successfully: {db_artist.id}")
        return db_artist
    except Exception as e:
        print(f"DEBUG: Failed to create artist: {e}")
        import traceback
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(500, f"Failed to create artist: {str(e)}")

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