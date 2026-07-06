from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, ConfigDict
from app.database import get_db
from app import models, schemas, auth
from app.services.notification import NotificationService

router = APIRouter(prefix="/admin", tags=["Admin"])


# ============ Pydantic Response Models ============

class ActivityItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    type: str
    action: str
    detail: str
    time: str
    icon: str
    color: str
    bg: str

class TopSongItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: str
    artist: str
    plays: str
    trend: str
    cover: str

class QuickStatItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    label: str
    value: str
    icon: str
    color: str

class DashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    total_users: int = 0
    total_artists: int = 0
    total_songs: int = 0
    total_streams: int = 0
    pending_approvals: int = 0
    recent_reports: int = 0
    recent_activity: List[ActivityItem] = []
    top_songs: List[TopSongItem] = []
    chart_data: List[int] = []
    quick_stats: List[QuickStatItem] = []


# ============ Helper: Time Ago ============

def time_ago(dt: Optional[datetime]) -> str:
    if not dt:
        return "Unknown"
    now = datetime.utcnow()
    diff = now - dt.replace(tzinfo=None) if dt.tzinfo else now - dt
    minutes = int(diff.total_seconds() / 60)
    hours = int(minutes / 60)
    days = int(hours / 24)
    if minutes < 1:
        return "Just now"
    if minutes < 60:
        return f"{minutes} min ago"
    if hours < 24:
        return f"{hours} hr ago"
    if days < 7:
        return f"{days} day{'s' if days > 1 else ''} ago"
    return dt.strftime("%b %d")


# ============ DASHBOARD ============

@router.get("/dashboard", response_model=DashboardResponse)
def dashboard_stats(
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    # --- Core Stats ---
    total_users = db.query(models.User).count()
    total_artists = db.query(models.Artist).count()
    total_songs = db.query(models.Song).count()
    total_streams = db.query(func.sum(models.Song.play_count)).scalar() or 0
    pending_songs = db.query(models.Song).filter(models.Song.is_approved == False).count()
    pending_artists = db.query(models.Artist).filter(models.Artist.is_approved == False).count()
    pending_approvals = pending_songs + pending_artists
    recent_reports = db.query(models.Report).filter(models.Report.status == "pending").count()

    # --- Recent Activity ---
    recent_activity = []
    
    # Recent users
    recent_users = db.query(models.User).order_by(desc(models.User.created_at)).limit(2).all()
    for u in recent_users:
        recent_activity.append(ActivityItem(
            type="user", action="New user registered",
            detail=f"{u.username} joined", time=time_ago(u.created_at),
            icon="Users", color="text-blue-400", bg="bg-blue-500/10"
        ))
    
    # Recent songs
    recent_songs = db.query(models.Song).order_by(desc(models.Song.created_at)).limit(2).all()
    for s in recent_songs:
        artist_name = s.artist.stage_name if s.artist else "Unknown"
        recent_activity.append(ActivityItem(
            type="song", action="Song uploaded",
            detail=f"{s.title} by {artist_name}", time=time_ago(s.created_at),
            icon="Music", color="text-fuchsia-400", bg="bg-fuchsia-500/10"
        ))
    
    # Recent approved artists
    recent_artists = db.query(models.Artist).filter(
        models.Artist.is_approved == True
    ).order_by(desc(models.Artist.created_at)).limit(1).all()
    for a in recent_artists:
        recent_activity.append(ActivityItem(
            type="artist", action="Artist approved",
            detail=f"{a.stage_name} verified", time=time_ago(a.created_at),
            icon="Disc", color="text-emerald-400", bg="bg-emerald-500/10"
        ))
    
    # Recent reports
    reports = db.query(models.Report).filter(
        models.Report.status == "pending"
    ).order_by(desc(models.Report.created_at)).limit(1).all()
    for r in reports:
        detail = r.reason[:40] + ('...' if len(r.reason) > 40 else '')
        recent_activity.append(ActivityItem(
            type="report", action="Content report",
            detail=detail, time=time_ago(r.created_at),
            icon="AlertTriangle", color="text-amber-400", bg="bg-amber-500/10"
        ))
    
    # Milestone songs
    milestone_songs = db.query(models.Song).filter(
        models.Song.play_count >= 100000
    ).order_by(desc(models.Song.play_count)).limit(1).all()
    for s in milestone_songs:
        artist_name = s.artist.stage_name if s.artist else "Unknown"
        plays_m = f"{s.play_count / 1000000:.1f}M" if s.play_count >= 1000000 else f"{s.play_count // 1000}K"
        recent_activity.append(ActivityItem(
            type="stream", action="Milestone reached",
            detail=f"{plays_m} plays on {s.title}", time=time_ago(s.created_at),
            icon="Headphones", color="text-violet-400", bg="bg-violet-500/10"
        ))
    
    recent_activity = recent_activity[:6]

    # --- Top Songs ---
    top_songs_db = db.query(models.Song).filter(
        models.Song.is_approved == True
    ).order_by(desc(models.Song.play_count)).limit(4).all()
    
    top_songs = []
    gradients = [
        "bg-gradient-to-br from-yellow-500 to-orange-600",
        "bg-gradient-to-br from-pink-500 to-rose-600",
        "bg-gradient-to-br from-violet-500 to-purple-600",
        "bg-gradient-to-br from-blue-500 to-cyan-600",
    ]
    
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
    
    for i, s in enumerate(top_songs_db):
        artist_name = s.artist.stage_name if s.artist else "Unknown"
        plays_str = f"{s.play_count / 1000000:.1f}M" if s.play_count >= 1000000 else f"{s.play_count / 1000:.1f}K" if s.play_count >= 1000 else str(s.play_count)
        
        recent_plays = db.query(func.count(models.PlayHistory.id)).filter(
            models.PlayHistory.song_id == s.id,
            models.PlayHistory.played_at >= seven_days_ago
        ).scalar() or 0
        
        prev_plays = db.query(func.count(models.PlayHistory.id)).filter(
            models.PlayHistory.song_id == s.id,
            models.PlayHistory.played_at >= fourteen_days_ago,
            models.PlayHistory.played_at < seven_days_ago
        ).scalar() or 0
        
        if prev_plays > 0:
            trend_pct = int(((recent_plays - prev_plays) / prev_plays) * 100)
        else:
            trend_pct = recent_plays * 10
        
        trend_str = f"+{trend_pct}%" if trend_pct >= 0 else f"{trend_pct}%"
        
        top_songs.append(TopSongItem(
            title=s.title, artist=artist_name, plays=plays_str,
            trend=trend_str, cover=gradients[i % len(gradients)]
        ))

    # --- Chart Data ---
    chart_data = []
    for month_offset in range(11, -1, -1):
        month_start = datetime.utcnow().replace(day=1) - timedelta(days=month_offset * 30)
        month_end = month_start + timedelta(days=30)
        monthly_plays = db.query(func.count(models.PlayHistory.id)).filter(
            models.PlayHistory.played_at >= month_start,
            models.PlayHistory.played_at < month_end
        ).scalar() or 0
        chart_data.append(min(monthly_plays, 100))
    
    if sum(chart_data) == 0:
        chart_data = [35, 55, 40, 70, 65, 85, 60, 90, 75, 100, 80, 95]

    # --- Quick Stats ---
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    likes_today = db.query(func.count(models.Like.id)).filter(
        models.Like.created_at >= today_start
    ).scalar() or 0
    
    quick_stats = [
        QuickStatItem(label="Uptime", value="89%", icon="Play", color="text-fuchsia-400"),
        QuickStatItem(label="Likes today", value=f"{likes_today:,}", icon="Heart", color="text-rose-400"),
    ]

    return DashboardResponse(
        total_users=total_users,
        total_artists=total_artists,
        total_songs=total_songs,
        total_streams=total_streams,
        pending_approvals=pending_approvals,
        recent_reports=recent_reports,
        recent_activity=recent_activity,
        top_songs=top_songs,
        chart_data=chart_data,
        quick_stats=quick_stats
    )


# ============ ARTISTS ============

@router.get("/artists", response_model=List[schemas.ArtistResponse])
def list_all_artists(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(models.Artist)
    if status == "pending":
        query = query.filter(models.Artist.is_approved == False)
    elif status == "approved":
        query = query.filter(models.Artist.is_approved == True)
    return query.order_by(models.Artist.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/artists/{artist_id}/approve")
def approve_artist(artist_id: int, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    artist = db.query(models.Artist).filter(models.Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(404, "Artist not found")
    artist.is_approved = True
    db.commit()
    
    NotificationService.create_approval_notification(
        db, artist, "artist profile", artist.stage_name
    )
    
    log = models.AdminLog(admin_id=current_user.id, action="approve_artist", entity_type="artist", entity_id=artist_id)
    db.add(log)
    db.commit()
    return {"message": "Artist approved"}

@router.delete("/artists/{artist_id}/reject")
def reject_artist(artist_id: int, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    artist = db.query(models.Artist).filter(models.Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(404, "Artist not found")
    
    user = db.query(models.User).filter(models.User.id == artist.user_id).first()
    if user and user.role == "artist":
        user.role = "user"
    
    log = models.AdminLog(admin_id=current_user.id, action="reject_artist", entity_type="artist", entity_id=artist_id)
    db.add(log)
    
    db.delete(artist)
    db.commit()
    return {"message": "Artist rejected and profile deleted"}


# ============ SONGS (ADMIN) ============

# ← NEW: Dedicated admin endpoint to list ALL songs with optional status filter
@router.get("/songs", response_model=List[schemas.SongResponse])
def list_admin_songs(
    status: Optional[str] = None,  # "pending", "approved", or None for all
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(models.Song)
    
    if status == "pending":
        query = query.filter(models.Song.is_approved == False)
    elif status == "approved":
        query = query.filter(models.Song.is_approved == True)
    # If no status filter, return ALL songs (both pending and approved)
    
    songs = query.order_by(models.Song.created_at.desc()).offset(skip).limit(limit).all()
    
    # Enrich with artist_name for frontend display
    result = []
    for song in songs:
        song_data = schemas.SongResponse.model_validate(song).model_dump()
        if song.artist:
            song_data["artist_name"] = song.artist.stage_name
        result.append(song_data)
    
    return result

@router.get("/pending-songs", response_model=List[schemas.SongResponse])
def pending_songs(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    songs = db.query(models.Song).filter(models.Song.is_approved == False).order_by(models.Song.created_at.desc()).all()
    
    result = []
    for song in songs:
        song_data = schemas.SongResponse.model_validate(song).model_dump()
        if song.artist:
            song_data["artist_name"] = song.artist.stage_name
        result.append(song_data)
    
    return result

@router.post("/songs/{song_id}/approve")
def approve_song(song_id: int, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Song not found")
    song.is_approved = True
    db.commit()
    
    if song.artist:
        NotificationService.create_approval_notification(
            db, song.artist, "song", song.title
        )
    
    log = models.AdminLog(admin_id=current_user.id, action="approve_song", entity_type="song", entity_id=song_id)
    db.add(log)
    db.commit()
    return {"message": "Song approved"}

@router.delete("/songs/{song_id}")
def delete_song(
    song_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Song not found")
    
    log = models.AdminLog(
        admin_id=current_user.id,
        action="delete_song",
        entity_type="song",
        entity_id=song_id
    )
    db.add(log)
    
    db.delete(song)
    db.commit()
    return {"message": "Song deleted"}


# ============ USERS ============

@router.get("/users", response_model=List[schemas.UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.User).offset(skip).limit(limit).all()

@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.id == current_user.id:
        raise HTTPException(400, "Cannot delete yourself")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# ============ REPORTS & LOGS ============

@router.get("/reports", response_model=List[schemas.ReportResponse])
def list_reports(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    return db.query(models.Report).order_by(models.Report.created_at.desc()).all()

@router.get("/logs", response_model=List[schemas.AdminLogResponse])
def admin_logs(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.AdminLog).order_by(models.AdminLog.created_at.desc()).offset(skip).limit(limit).all()