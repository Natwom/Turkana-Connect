from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/", response_model=schemas.SearchResult)
def search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    search_term = f"%{q}%"
    
    # SONGS: Search title, lyrics, category name, artist genre, and artist stage_name
    songs = db.query(models.Song).join(
        models.Category, models.Song.category_id == models.Category.id, isouter=True
    ).join(
        models.Artist, models.Song.artist_id == models.Artist.id, isouter=True
    ).filter(
        models.Song.is_approved == True,
        or_(
            models.Song.title.ilike(search_term),
            models.Song.lyrics.ilike(search_term),
            models.Category.name.ilike(search_term),
            models.Artist.genre.ilike(search_term),
            models.Artist.stage_name.ilike(search_term)
        )
    ).limit(20).all()
    
    # ARTISTS: Search stage_name, bio, AND genre
    artists = db.query(models.Artist).filter(
        or_(
            models.Artist.stage_name.ilike(search_term),
            models.Artist.bio.ilike(search_term),
            models.Artist.genre.ilike(search_term)
        )
    ).limit(10).all()
    
    # ALBUMS: Search title, description, and artist stage_name
    albums = db.query(models.Album).join(
        models.Artist, models.Album.artist_id == models.Artist.id, isouter=True
    ).filter(
        or_(
            models.Album.title.ilike(search_term),
            models.Album.description.ilike(search_term),
            models.Artist.stage_name.ilike(search_term)
        )
    ).limit(10).all()
    
    # PLAYLISTS
    playlists = db.query(models.Playlist).filter(
        models.Playlist.is_public == True,
        models.Playlist.name.ilike(search_term)
    ).limit(10).all()
    
    return {"songs": songs, "artists": artists, "albums": albums, "playlists": playlists}