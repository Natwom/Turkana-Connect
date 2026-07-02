from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/users", tags=["Users"])

def get_or_create_settings(db: Session, user_id: int):
    settings = db.query(models.UserSettings).filter(models.UserSettings.user_id == user_id).first()
    if not settings:
        settings = models.UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.get("/", response_model=List[schemas.UserResponse])
def list_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(models.User).offset(skip).limit(limit).all()

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@router.patch("/me", response_model=schemas.UserResponse)
def update_me(
    user_update: schemas.UserBase,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(current_user, field) and field != 'id':
            setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

# ============ NEW: USER STATS ============
@router.get("/me/stats")
def get_my_stats(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user listening stats: total minutes, liked songs count, playlists count, top genre"""
    
    # Total listening minutes from play history
    total_seconds = db.query(func.sum(models.PlayHistory.duration_played)).filter(
        models.PlayHistory.user_id == current_user.id
    ).scalar() or 0
    total_minutes = round(total_seconds / 60)
    
    # Liked songs count
    liked_count = db.query(func.count(models.Like.id)).filter(
        models.Like.user_id == current_user.id
    ).scalar() or 0
    
    # Playlists count
    playlists_count = db.query(func.count(models.Playlist.id)).filter(
        models.Playlist.user_id == current_user.id
    ).scalar() or 0
    
    # Top genre from play history
    top_genre = db.query(models.Artist.genre, func.count(models.PlayHistory.id).label('play_count')).\
        join(models.Song, models.PlayHistory.song_id == models.Song.id).\
        join(models.Artist, models.Song.artist_id == models.Artist.id).\
        filter(models.PlayHistory.user_id == current_user.id).\
        group_by(models.Artist.genre).\
        order_by(desc('play_count')).\
        first()
    
    # Followed artists count
    followed_count = db.query(func.count(models.Follow.id)).filter(
        models.Follow.follower_id == current_user.id
    ).scalar() or 0
    
    return {
        "total_minutes_listened": total_minutes,
        "total_hours_listened": round(total_minutes / 60, 1),
        "liked_songs_count": liked_count,
        "playlists_count": playlists_count,
        "followed_artists_count": followed_count,
        "top_genre": top_genre[0] if top_genre else "Unknown",
        "member_since": current_user.created_at.isoformat() if current_user.created_at else None
    }

# ============ NEW: USER ACTIVITY ============
@router.get("/me/activity")
def get_my_activity(
    limit: int = 10,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get recent user activity: likes, plays, playlist creations"""
    
    activities = []
    
    # Recent likes
    likes = db.query(models.Like, models.Song, models.Artist).\
        join(models.Song, models.Like.song_id == models.Song.id).\
        join(models.Artist, models.Song.artist_id == models.Artist.id).\
        filter(models.Like.user_id == current_user.id).\
        order_by(desc(models.Like.created_at)).\
        limit(limit).\
        all()
    
    for like, song, artist in likes:
        activities.append({
            "type": "liked",
            "song": song.title,
            "artist": artist.stage_name,
            "time": like.created_at.isoformat() if like.created_at else None,
            "song_id": song.id,
            "artist_id": artist.id
        })
    
    # Recent plays
    plays = db.query(models.PlayHistory, models.Song, models.Artist).\
        join(models.Song, models.PlayHistory.song_id == models.Song.id).\
        join(models.Artist, models.Song.artist_id == models.Artist.id).\
        filter(models.PlayHistory.user_id == current_user.id).\
        order_by(desc(models.PlayHistory.played_at)).\
        limit(limit).\
        all()
    
    for play, song, artist in plays:
        activities.append({
            "type": "played",
            "song": song.title,
            "artist": artist.stage_name,
            "time": play.played_at.isoformat() if play.played_at else None,
            "duration_played": play.duration_played,
            "song_id": song.id,
            "artist_id": artist.id
        })
    
    # Recent playlist creations
    playlists = db.query(models.Playlist).\
        filter(models.Playlist.user_id == current_user.id).\
        order_by(desc(models.Playlist.created_at)).\
        limit(limit).\
        all()
    
    for playlist in playlists:
        activities.append({
            "type": "playlist",
            "playlist_name": playlist.name,
            "time": playlist.created_at.isoformat() if playlist.created_at else None,
            "playlist_id": playlist.id
        })
    
    # Sort by time descending
    activities.sort(key=lambda x: x["time"] or "", reverse=True)
    
    return activities[:limit]

# ============ NEW: PLAY HISTORY ============
@router.get("/me/history")
def get_my_history(
    limit: int = 20,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's play history for 'Recently Played' tab"""
    
    history = db.query(models.PlayHistory, models.Song, models.Artist).\
        join(models.Song, models.PlayHistory.song_id == models.Song.id).\
        join(models.Artist, models.Song.artist_id == models.Artist.id).\
        filter(models.PlayHistory.user_id == current_user.id).\
        order_by(desc(models.PlayHistory.played_at)).\
        limit(limit).\
        all()
    
    result = []
    for play, song, artist in history:
        result.append({
            "id": play.id,
            "song_id": song.id,
            "title": song.title,
            "artist_name": artist.stage_name,
            "artist_id": artist.id,
            "cover_url": song.cover_url,
            "duration": song.duration,
            "played_at": play.played_at.isoformat() if play.played_at else None,
            "duration_played": play.duration_played
        })
    
    return result

# ============ NEW: TOP ARTISTS ============
@router.get("/me/top-artists")
def get_my_top_artists(
    limit: int = 5,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's most played artists"""
    
    top_artists = db.query(
        models.Artist,
        func.count(models.PlayHistory.id).label('play_count'),
        func.sum(models.PlayHistory.duration_played).label('total_duration')
    ).\
        join(models.Song, models.PlayHistory.song_id == models.Song.id).\
        join(models.Artist, models.Song.artist_id == models.Artist.id).\
        filter(models.PlayHistory.user_id == current_user.id).\
        group_by(models.Artist.id).\
        order_by(desc('play_count')).\
        limit(limit).\
        all()
    
    result = []
    for artist, play_count, total_duration in top_artists:
        result.append({
            "id": artist.id,
            "stage_name": artist.stage_name,
            "image_url": artist.image_url,
            "play_count": play_count,
            "total_minutes": round((total_duration or 0) / 60)
        })
    
    return result

# ============ NEW: LISTENING TRENDS ============
@router.get("/me/trends")
def get_my_trends(
    days: int = 30,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get listening trends for the chart (last N days)"""
    
    since = datetime.utcnow() - timedelta(days=days)
    
    # Group by day
    daily = db.query(
        func.date(models.PlayHistory.played_at).label('date'),
        func.sum(models.PlayHistory.duration_played).label('total_seconds')
    ).\
        filter(
            models.PlayHistory.user_id == current_user.id,
            models.PlayHistory.played_at >= since
        ).\
        group_by(func.date(models.PlayHistory.played_at)).\
        order_by('date').\
        all()
    
    # Fill in missing days with 0
    from collections import defaultdict
    data_map = {str(d.date): round(d.total_seconds / 60) for d in daily}
    
    result = []
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=days - 1 - i)).strftime('%Y-%m-%d')
        result.append({
            "date": date,
            "minutes": data_map.get(date, 0)
        })
    
    return result

@router.get("/me/settings", response_model=schemas.UserSettingsResponse)
def get_my_settings(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_or_create_settings(db, current_user.id)

@router.patch("/me/settings", response_model=schemas.UserSettingsResponse)
def update_my_settings(
    settings_update: schemas.UserSettingsUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    settings = get_or_create_settings(db, current_user.id)
    update_data = settings_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(settings, field):
            setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings

@router.delete("/me", response_model=dict)
def delete_me(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}