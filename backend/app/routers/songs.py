from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app import models, schemas, auth
from app.dependencies import save_upload_file
from app.services.notification import NotificationService

router = APIRouter(prefix="/songs", tags=["Songs"])

@router.get("/", response_model=List[schemas.SongResponse])
def list_songs(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    approved_only: bool = True,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(models.Song)
        if approved_only:
            query = query.filter(models.Song.is_approved == True)
        if category:
            query = query.join(models.Category).filter(models.Category.slug == category)
        
        songs = query.order_by(models.Song.created_at.desc()).offset(skip).limit(limit).all()
        return songs
    except Exception as e:
        import traceback
        print(f"ERROR in list_songs: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.post("/", response_model=schemas.SongResponse, status_code=201)
async def create_song(
    title: str = Form(...),
    album_id: Optional[int] = Form(None),
    category_id: Optional[int] = Form(None),
    lyrics: Optional[str] = Form(None),
    audio: UploadFile = File(...),
    cover: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(auth.require_artist),
    db: Session = Depends(get_db)
):
    artist = db.query(models.Artist).filter(models.Artist.user_id == current_user.id).first()
    if not artist:
        raise HTTPException(403, "You need an artist profile to upload songs")
    
    audio_url = await save_upload_file(audio, "audio")
    cover_url = None
    if cover:
        cover_url = await save_upload_file(cover, "covers")
    
    db_song = models.Song(
        title=title,
        artist_id=artist.id,
        album_id=album_id,
        category_id=category_id,
        audio_url=audio_url,
        cover_url=cover_url,
        lyrics=lyrics,
        is_approved=False
    )
    db.add(db_song)
    db.commit()
    db.refresh(db_song)
    
    # Notify followers about new release
    NotificationService.create_new_release_notification(db, artist, db_song)
    
    return db_song

@router.get("/{song_id}", response_model=schemas.SongDetail)
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Song not found")
    return song

@router.post("/{song_id}/play")
def record_play(song_id: int, db: Session = Depends(get_db)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Song not found")
    song.play_count += 1
    song.artist.total_streams += 1
    db.commit()
    return {"message": "Play recorded"}

@router.get("/{song_id}/stream")
def stream_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(models.Song).filter(models.Song.id == song_id, models.Song.is_approved == True).first()
    if not song:
        raise HTTPException(404, "Song not found")
    return {"audio_url": song.audio_url, "title": song.title}