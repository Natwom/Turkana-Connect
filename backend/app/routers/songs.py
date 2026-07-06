from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from typing import Optional, List
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas, auth
from app.dependencies import save_upload_file, delete_upload_file
from app.services.notification import NotificationService

router = APIRouter(prefix="/songs", tags=["Songs"])

@router.get("/", response_model=List[schemas.SongResponse])
def list_songs(
    skip: int = 0,
    limit: int = 20,
    sort: Optional[str] = None,
    category_id: Optional[int] = None,
    category: Optional[str] = None,
    artist_id: Optional[int] = None,
    search: Optional[str] = None,
    approved_only: Optional[bool] = True,  # ← FIXED: Added param, defaults to True for public safety
    db: Session = Depends(get_db)
):
    # ← FIXED: Only filter by approval when approved_only is True (public requests)
    # When approved_only=False (admin), return ALL songs including pending
    query = db.query(models.Song)
    if approved_only:
        query = query.filter(models.Song.is_approved == True)
    
    if category_id:
        query = query.filter(models.Song.category_id == category_id)
    
    if category:
        query = query.join(models.Category).filter(
            or_(
                models.Category.name.ilike(f"%{category}%"),
                models.Category.slug.ilike(f"%{category}%")
            )
        )
    
    if artist_id:
        query = query.filter(models.Song.artist_id == artist_id)
    if search:
        query = query.filter(
            or_(
                models.Song.title.ilike(f"%{search}%"),
                models.Song.lyrics.ilike(f"%{search}%")
            )
        )
    
    if sort == "trending":
        query = query.order_by(desc(models.Song.play_count), desc(models.Song.likes_count))
    elif sort == "newest":
        query = query.order_by(desc(models.Song.created_at))
    elif sort == "likes":
        query = query.order_by(desc(models.Song.likes_count))
    else:
        query = query.order_by(desc(models.Song.created_at))
    
    songs = query.offset(skip).limit(limit).all()
    
    result = []
    for song in songs:
        song_data = schemas.SongResponse.model_validate(song).model_dump()
        if song.artist:
            song_data["artist_name"] = song.artist.stage_name
        result.append(song_data)
    
    return result

@router.get("/{song_id}", response_model=schemas.SongDetail)
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Song not found")
    return song

@router.post("/{song_id}/play")
def record_play(
    song_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Song not found")
    
    song.play_count += 1
    
    play_history = models.PlayHistory(
        user_id=current_user.id,
        song_id=song_id,
        duration_played=song.duration or 0
    )
    db.add(play_history)
    db.commit()
    
    if song.artist:
        song.artist.total_streams = db.query(func.sum(models.Song.play_count)).filter(
            models.Song.artist_id == song.artist_id
        ).scalar() or 0
        db.commit()
    
    return {"message": "Play recorded"}

@router.get("/{song_id}/stream")
def get_stream_url(song_id: int, db: Session = Depends(get_db)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Song not found")
    return {"stream_url": song.audio_url, "song_id": song_id}

@router.post("/", response_model=schemas.SongResponse, status_code=201)
async def create_song(
    title: str = Form(...),
    artist_id: Optional[int] = Form(None),
    album_id: Optional[int] = Form(None),
    category_id: Optional[int] = Form(None),
    audio: UploadFile = File(...),
    cover: Optional[UploadFile] = File(None),
    lyrics: Optional[str] = Form(None),
    is_explicit: bool = Form(False),
    current_user: models.User = Depends(auth.require_artist),
    db: Session = Depends(get_db)
):
    # Resolve artist_id
    if not artist_id:
        artist = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
        if not artist:
            raise HTTPException(400, "You must create an artist profile first")
        artist_id = artist.id
    
    # Verify ownership
    artist = db.query(models.Artist).filter(models.Artist.id == artist_id).first()
    if not artist or artist.user_id != current_user.id:
        raise HTTPException(403, "You can only upload songs for your own artist profile")
    
    # Defense in depth: verify approval again
    if not artist.is_approved:
        raise HTTPException(403, "Your artist profile is pending approval. You cannot upload songs yet.")
    
    # Upload files FIRST (before any DB writes)
    audio_url = None
    cover_url = None
    
    try:
        audio_url = await save_upload_file(audio, "audio")
    except Exception as e:
        raise HTTPException(500, f"Audio upload failed: {str(e)}")
    
    if cover:
        try:
            cover_url = await save_upload_file(cover, "covers")
        except Exception as e:
            # Clean up audio if cover fails
            if audio_url:
                try:
                    await delete_upload_file(audio_url)
                except:
                    pass
            raise HTTPException(500, f"Cover upload failed: {str(e)}")
    
    # Only create DB record after all uploads succeed
    db_song = models.Song(
        title=title,
        artist_id=artist_id,
        album_id=album_id,
        category_id=category_id,
        audio_url=audio_url,
        cover_url=cover_url,
        lyrics=lyrics,
        is_explicit=is_explicit,
        is_approved=False,
        duration=0
    )
    
    try:
        db.add(db_song)
        db.commit()
        db.refresh(db_song)
    except Exception as e:
        # Clean up files if DB fails
        if audio_url:
            try:
                await delete_upload_file(audio_url)
            except:
                pass
        if cover_url:
            try:
                await delete_upload_file(cover_url)
            except:
                pass
        raise HTTPException(500, f"Failed to save song: {str(e)}")
    
    # Notify admins (non-critical)
    try:
        NotificationService.create_song_upload_notification(db, db_song, current_user)
    except Exception as e:
        print(f"Notification failed: {e}")
    
    return db_song