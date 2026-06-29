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
    
    songs = db.query(models.Song).filter(
        or_(
            models.Song.title.ilike(search_term),
            models.Song.lyrics.ilike(search_term)
        )
    ).limit(10).all()
    
    artists = db.query(models.Artist).filter(
        or_(
            models.Artist.stage_name.ilike(search_term),
            models.Artist.bio.ilike(search_term)
        )
    ).limit(10).all()
    
    albums = db.query(models.Album).filter(
        or_(
            models.Album.title.ilike(search_term),
            models.Album.description.ilike(search_term)
        )
    ).limit(10).all()
    
    playlists = db.query(models.Playlist).filter(
        models.Playlist.is_public == True,
        models.Playlist.name.ilike(search_term)
    ).limit(10).all()
    
    return {"songs": songs, "artists": artists, "albums": albums, "playlists": playlists}