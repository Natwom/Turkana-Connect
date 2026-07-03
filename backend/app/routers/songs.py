from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import Optional, List
from app.database import get_db
from app import models, schemas, auth
from app.dependencies import save_upload_file
from app.services.notification import NotificationService

router = APIRouter(prefix="/songs", tags=["Songs"])

def _song_to_response(song: models.Song) -> schemas.SongResponse:
    """Convert Song ORM to response dict with artist_name populated."""
    data = {
        "id": song.id,
        "title": song.title,
        "duration": song.duration,
        "lyrics": song.lyrics,
        "is_explicit": song.is_explicit,
        "artist_id": song.artist_id,
        "artist_name": song.artist.stage_name if song.artist else None,
        "album_id": song.album_id,
        "category_id": song.category_id,
        "audio_url": song.audio_url,
        "cover_url": song.cover_url,
        "is_approved": song.is_approved,
        "play_count": song.play_count,
        "likes_count": song.likes_count,
        "created_at": song.created_at,
    }
    return schemas.SongResponse.model_validate(data)

@router.get("/", response_model=List[schemas.SongResponse])
def list_songs(
    skip: int = 0,
    limit: int = 20,
    sort: Optional[str] = Query(None, description="Sort by: 'trending' (play_count desc), 'newest' (created_at desc), 'likes' (likes_count desc)"),
    category: Optional[str] = None,
    approved_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    List songs with optional sorting:
    - sort=trending: Most played songs first
    - sort=newest: Newest uploaded songs first
    - sort=likes: Most liked songs first
    - no sort: Default to newest
    """
    try:
        query = db.query(models.Song).options(joinedload(models.Song.artist))
        
        if approved_only:
            query = query.filter(models.Song.is_approved == True)
        if category:
            query = query.join(models.Category).filter(models.Category.slug == category)
        
        # Apply sorting
        if sort == "trending":
            query = query.order_by(desc(models.Song.play_count), desc(models.Song.created_at))
        elif sort == "likes":
            query = query.order_by(desc(models.Song.likes_count), desc(models.Song.created_at))
        else:
            # Default: newest first
            query = query.order_by(desc(models.Song.created_at))
        
        songs = query.offset(skip).limit(limit).all()
        return [_song_to_response(song) for song in songs]
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
    
    # Re-fetch with artist loaded so artist_name is populated
    db_song = db.query(models.Song).options(joinedload(models.Song.artist)).filter(models.Song.id == db_song.id).first()
    
    # Notify followers about new release
    NotificationService.create_new_release_notification(db, artist, db_song)
    
    return _song_to_response(db_song)

@router.get("/{song_id}", response_model=schemas.SongDetail)
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(models.Song).options(
        joinedload(models.Song.artist),
        joinedload(models.Song.album),
        joinedload(models.Song.category)
    ).filter(models.Song.id == song_id).first()
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