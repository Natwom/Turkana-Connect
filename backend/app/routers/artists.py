from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas, auth
from app.dependencies import save_upload_file
from app.services.notification import NotificationService

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

@router.get("/featured", response_model=List[schemas.ArtistResponse])
def get_featured_artists(limit: int = 12, db: Session = Depends(get_db)):
    try:
        return db.query(models.Artist).filter(
            models.Artist.is_approved == True
        ).order_by(
            desc(models.Artist.is_verified),
            desc(models.Artist.followers_count),
            desc(models.Artist.total_streams)
        ).limit(limit).all()
    except Exception as e:
        import traceback
        print(f"ERROR in get_featured_artists: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.get("/following/feed", response_model=List[schemas.SongResponse])
def get_following_feed(
    limit: int = 20,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    followed_ids = db.query(models.Follow.artist_id).filter(
        models.Follow.follower_id == current_user.id
    ).subquery()
    
    songs = db.query(models.Song).filter(
        models.Song.artist_id.in_(followed_ids),
        models.Song.is_approved == True
    ).order_by(
        desc(models.Song.created_at)
    ).limit(limit).all()
    
    result = []
    for song in songs:
        song_data = schemas.SongResponse.model_validate(song).model_dump()
        if song.artist:
            song_data["artist_name"] = song.artist.stage_name
        result.append(song_data)
    
    return result

@router.get("/following/list", response_model=List[schemas.ArtistResponse])
def get_following_list(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    follows = db.query(models.Follow).filter(
        models.Follow.follower_id == current_user.id
    ).all()
    
    artist_ids = [f.artist_id for f in follows]
    if not artist_ids:
        return []
    
    artists = db.query(models.Artist).filter(
        models.Artist.id.in_(artist_ids)
    ).all()
    
    return artists

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
    
    existing = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if existing:
        print(f"DEBUG: Artist profile already exists for user {current_user.id}")
        raise HTTPException(400, "Artist profile already exists")
    
    if current_user.role not in ["artist", "admin"]:
        print(f"DEBUG: Updating user {current_user.id} role from {current_user.role} to artist")
        current_user.role = "artist"
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        print(f"DEBUG: User role updated to {current_user.role}")
    
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
        
        NotificationService.create_artist_application_notification(db, current_user)
        
        return db_artist
    except Exception as e:
        print(f"DEBUG: Failed to create artist: {e}")
        import traceback
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(500, f"Failed to create artist: {str(e)}")

# ============ FIXED: Artist dashboard only shows APPROVED songs in public list ============

@router.get("/me", response_model=schemas.ArtistDashboard)
def get_my_artist_profile(
    current_user: models.User = Depends(auth.require_artist),
    db: Session = Depends(get_db)
):
    """Get the logged-in artist's full dashboard profile (songs, albums, stats)"""
    artist = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if not artist:
        raise HTTPException(404, "Artist profile not found. Please create one first.")
    
    # Aggregate stats
    total_songs = db.query(func.count(models.Song.id)).filter(
        models.Song.artist_id == artist.id
    ).scalar() or 0
    
    total_albums = db.query(func.count(models.Album.id)).filter(
        models.Album.artist_id == artist.id
    ).scalar() or 0
    
    total_streams = db.query(func.sum(models.Song.play_count)).filter(
        models.Song.artist_id == artist.id
    ).scalar() or 0
    
    total_likes = db.query(func.sum(models.Song.likes_count)).filter(
        models.Song.artist_id == artist.id
    ).scalar() or 0
    
    pending_songs = db.query(func.count(models.Song.id)).filter(
        models.Song.artist_id == artist.id,
        models.Song.is_approved == False
    ).scalar() or 0
    
    # Monthly listeners
    song_ids = [s.id for s in artist.songs]
    monthly_listeners = 0
    if song_ids:
        monthly_listeners = db.query(func.count(func.distinct(models.PlayHistory.user_id))).filter(
            models.PlayHistory.song_id.in_(song_ids),
            models.PlayHistory.played_at >= datetime.utcnow() - timedelta(days=30)
        ).scalar() or 0
    
    # FIXED: Only include approved songs in the public-facing songs list
    # Pending songs are shown separately via pending_songs count
    approved_songs = [s for s in artist.songs if s.is_approved]
    
    artist_data = schemas.ArtistResponse.model_validate(artist).model_dump()
    artist_data["songs"] = [schemas.SongResponse.model_validate(s).model_dump() for s in approved_songs]
    artist_data["albums"] = [schemas.AlbumResponse.model_validate(a).model_dump() for a in artist.albums]
    artist_data["total_songs"] = total_songs
    artist_data["total_albums"] = total_albums
    artist_data["total_streams"] = total_streams
    artist_data["total_likes"] = total_likes
    artist_data["pending_songs"] = pending_songs
    artist_data["monthly_listeners"] = monthly_listeners
    
    return artist_data

@router.patch("/me", response_model=schemas.ArtistResponse)
async def update_my_artist_profile(
    stage_name: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    genre: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    region: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(auth.require_artist),
    db: Session = Depends(get_db)
):
    artist = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if not artist:
        raise HTTPException(404, "Artist profile not found")
    
    if stage_name is not None:
        artist.stage_name = stage_name
    if bio is not None:
        artist.bio = bio
    if genre is not None:
        artist.genre = genre
    if country is not None:
        artist.country = country
    if region is not None:
        artist.region = region
    
    if image:
        try:
            image_url = await save_upload_file(image, "images")
            artist.image_url = image_url
        except Exception as e:
            raise HTTPException(500, f"Image upload failed: {str(e)}")
    
    db.commit()
    db.refresh(artist)
    return artist

@router.get("/me/stats")
def get_my_artist_stats(
    current_user: models.User = Depends(auth.require_artist),
    db: Session = Depends(get_db)
):
    artist = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if not artist:
        raise HTTPException(404, "Artist profile not found")
    
    top_songs = db.query(
        models.Song.id,
        models.Song.title,
        models.Song.play_count,
        models.Song.likes_count
    ).filter(
        models.Song.artist_id == artist.id
    ).order_by(desc(models.Song.play_count)).limit(10).all()
    
    since = datetime.utcnow() - timedelta(days=30)
    daily_streams = db.query(
        func.date(models.PlayHistory.played_at).label('date'),
        func.count(models.PlayHistory.id).label('stream_count')
    ).join(
        models.Song, models.PlayHistory.song_id == models.Song.id
    ).filter(
        models.Song.artist_id == artist.id,
        models.PlayHistory.played_at >= since
    ).group_by(
        func.date(models.PlayHistory.played_at)
    ).order_by('date').all()
    
    data_map = {str(d.date): d.stream_count for d in daily_streams}
    stream_trend = []
    for i in range(30):
        date = (datetime.utcnow() - timedelta(days=29 - i)).strftime('%Y-%m-%d')
        stream_trend.append({"date": date, "streams": data_map.get(date, 0)})
    
    recent_follows = db.query(func.count(models.Follow.id)).filter(
        models.Follow.artist_id == artist.id,
        models.Follow.created_at >= since
    ).scalar() or 0
    
    return {
        "top_songs": [
            {"id": s.id, "title": s.title, "plays": s.play_count, "likes": s.likes_count}
            for s in top_songs
        ],
        "stream_trend": stream_trend,
        "recent_follows": recent_follows,
        "total_followers": artist.followers_count
    }

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
    db.refresh(follow)
    
    NotificationService.create_follow_notification(db, follow)
    
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