from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app import models

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def get_range_dates(range_val: str):
    now = datetime.utcnow()
    if range_val == '24h':
        return now - timedelta(hours=24), now - timedelta(hours=48), 'hour'
    elif range_val == '7d':
        return now - timedelta(days=7), now - timedelta(days=14), 'day'
    elif range_val == '30d':
        return now - timedelta(days=30), now - timedelta(days=60), 'day'
    elif range_val == '90d':
        return now - timedelta(days=90), now - timedelta(days=180), 'week'
    elif range_val == '1y':
        return now - timedelta(days=365), now - timedelta(days=730), 'month'
    else:
        return now - timedelta(days=7), now - timedelta(days=14), 'day'


def format_number(num):
    if num >= 1000000:
        return f"{num / 1000000:.1f}M"
    elif num >= 1000:
        return f"{num / 1000:.1f}K"
    return str(int(num))


def format_duration(seconds):
    if not seconds or seconds == 0:
        return "0:00"
    return f"{int(seconds // 60)}:{int(seconds % 60):02d}"


def calc_change(current, previous):
    if previous > 0:
        pct = int(((current - previous) / previous) * 100)
        return f"{pct}%", pct >= 0
    elif current > 0:
        return f"+{current * 10}%", True
    return "+0%", True


# ============ TOP SONGS (with period growth) ============

@router.get("/top-songs")
def top_songs(range: str = '7d', limit: int = 10, db: Session = Depends(get_db)):
    current_start, previous_start, _ = get_range_dates(range)

    songs = db.query(models.Song).filter(
        models.Song.is_approved == True
    ).order_by(models.Song.play_count.desc()).limit(limit).all()

    result = []
    for song in songs:
        recent_plays = db.query(func.count(models.PlayHistory.id)).filter(
            models.PlayHistory.song_id == song.id,
            models.PlayHistory.played_at >= current_start
        ).scalar() or 0

        prev_plays = db.query(func.count(models.PlayHistory.id)).filter(
            models.PlayHistory.song_id == song.id,
            models.PlayHistory.played_at >= previous_start,
            models.PlayHistory.played_at < current_start
        ).scalar() or 0

        change_str, _ = calc_change(recent_plays, prev_plays)

        result.append({
            "id": song.id,
            "title": song.title,
            "cover_url": song.cover_url,
            "play_count": song.play_count,
            "like_count": song.likes_count,
            "artist": {"stage_name": song.artist.stage_name} if song.artist else None,
            "growth": change_str
        })
    return result


# ============ TOP ARTISTS (with period growth) ============

@router.get("/top-artists")
def top_artists(range: str = '7d', limit: int = 10, db: Session = Depends(get_db)):
    current_start, previous_start, _ = get_range_dates(range)

    artists = db.query(models.Artist).filter(
        models.Artist.is_approved == True
    ).order_by(models.Artist.total_streams.desc()).limit(limit).all()

    result = []
    for artist in artists:
        recent_streams = db.query(func.count(models.PlayHistory.id)).join(
            models.Song, models.PlayHistory.song_id == models.Song.id
        ).filter(
            models.Song.artist_id == artist.id,
            models.PlayHistory.played_at >= current_start
        ).scalar() or 0

        prev_streams = db.query(func.count(models.PlayHistory.id)).join(
            models.Song, models.PlayHistory.song_id == models.Song.id
        ).filter(
            models.Song.artist_id == artist.id,
            models.PlayHistory.played_at >= previous_start,
            models.PlayHistory.played_at < current_start
        ).scalar() or 0

        change_str, _ = calc_change(recent_streams, prev_streams)

        result.append({
            "id": artist.id,
            "stage_name": artist.stage_name,
            "image_url": artist.image_url,
            "genre": artist.genre,
            "total_streams": artist.total_streams,
            "followers_count": artist.followers_count,
            "growth": change_str
        })
    return result


# ============ OVERVIEW STATS (with period comparison) ============

@router.get("/overview")
def overview(range: str = '7d', db: Session = Depends(get_db)):
    current_start, previous_start, _ = get_range_dates(range)

    # Streams
    total_streams = db.query(func.count(models.PlayHistory.id)).filter(
        models.PlayHistory.played_at >= current_start
    ).scalar() or 0

    prev_streams = db.query(func.count(models.PlayHistory.id)).filter(
        models.PlayHistory.played_at >= previous_start,
        models.PlayHistory.played_at < current_start
    ).scalar() or 0

    # Active users
    active_users = db.query(func.count(func.distinct(models.PlayHistory.user_id))).filter(
        models.PlayHistory.played_at >= current_start
    ).scalar() or 0

    prev_active_users = db.query(func.count(func.distinct(models.PlayHistory.user_id))).filter(
        models.PlayHistory.played_at >= previous_start,
        models.PlayHistory.played_at < current_start
    ).scalar() or 0

    # Avg listen time
    avg_duration = db.query(func.avg(models.PlayHistory.duration_played)).filter(
        models.PlayHistory.played_at >= current_start
    ).scalar() or 0

    prev_avg_duration = db.query(func.avg(models.PlayHistory.duration_played)).filter(
        models.PlayHistory.played_at >= previous_start,
        models.PlayHistory.played_at < current_start
    ).scalar() or 0

    # Engagement rate = (likes + comments) / max(streams, 1) * 100
    likes_count = db.query(func.count(models.Like.id)).filter(
        models.Like.created_at >= current_start
    ).scalar() or 0

    comments_count = db.query(func.count(models.Comment.id)).filter(
        models.Comment.created_at >= current_start
    ).scalar() or 0

    engagement_rate = round((likes_count + comments_count) / max(total_streams, 1) * 100, 1)

    prev_likes = db.query(func.count(models.Like.id)).filter(
        models.Like.created_at >= previous_start,
        models.Like.created_at < current_start
    ).scalar() or 0

    prev_comments = db.query(func.count(models.Comment.id)).filter(
        models.Comment.created_at >= previous_start,
        models.Comment.created_at < current_start
    ).scalar() or 0

    prev_engagement = round((prev_likes + prev_comments) / max(prev_streams, 1) * 100, 1)

    sc, su = calc_change(total_streams, prev_streams)
    uc, uu = calc_change(active_users, prev_active_users)
    dc, du = calc_change(avg_duration, prev_avg_duration)
    ec, eu = calc_change(engagement_rate, prev_engagement)

    return {
        "total_streams": {"value": format_number(total_streams), "change": sc, "up": su},
        "active_users": {"value": format_number(active_users), "change": uc, "up": uu},
        "avg_listen_time": {"value": format_duration(avg_duration), "change": dc, "up": du},
        "engagement_rate": {"value": f"{engagement_rate}%", "change": ec, "up": eu}
    }


# ============ STREAM ACTIVITY CHART DATA ============

@router.get("/stream-activity")
def stream_activity(range: str = '7d', db: Session = Depends(get_db)):
    now = datetime.utcnow()

    if range == '24h':
        points = []
        for i in range(23, -1, -1):
            hour_start = now - timedelta(hours=i + 1)
            hour_end = now - timedelta(hours=i)
            streams = db.query(func.count(models.PlayHistory.id)).filter(
                models.PlayHistory.played_at >= hour_start,
                models.PlayHistory.played_at < hour_end
            ).scalar() or 0
            users = db.query(func.count(func.distinct(models.PlayHistory.user_id))).filter(
                models.PlayHistory.played_at >= hour_start,
                models.PlayHistory.played_at < hour_end
            ).scalar() or 0
            points.append({"label": hour_start.strftime("%H:%M"), "streams": streams, "users": users})
        return points

    elif range == '7d':
        points = []
        for i in range(6, -1, -1):
            day_start = now - timedelta(days=i + 1)
            day_end = now - timedelta(days=i)
            streams = db.query(func.count(models.PlayHistory.id)).filter(
                models.PlayHistory.played_at >= day_start,
                models.PlayHistory.played_at < day_end
            ).scalar() or 0
            users = db.query(func.count(func.distinct(models.PlayHistory.user_id))).filter(
                models.PlayHistory.played_at >= day_start,
                models.PlayHistory.played_at < day_end
            ).scalar() or 0
            points.append({"label": day_start.strftime("%a"), "streams": streams, "users": users})
        return points

    elif range == '30d':
        points = []
        for i in range(29, -1, -1):
            day_start = now - timedelta(days=i + 1)
            day_end = now - timedelta(days=i)
            streams = db.query(func.count(models.PlayHistory.id)).filter(
                models.PlayHistory.played_at >= day_start,
                models.PlayHistory.played_at < day_end
            ).scalar() or 0
            users = db.query(func.count(func.distinct(models.PlayHistory.user_id))).filter(
                models.PlayHistory.played_at >= day_start,
                models.PlayHistory.played_at < day_end
            ).scalar() or 0
            points.append({"label": day_start.strftime("%d"), "streams": streams, "users": users})
        return points

    elif range == '90d':
        points = []
        for i in range(11, -1, -1):
            week_start = now - timedelta(weeks=i + 1)
            week_end = now - timedelta(weeks=i)
            streams = db.query(func.count(models.PlayHistory.id)).filter(
                models.PlayHistory.played_at >= week_start,
                models.PlayHistory.played_at < week_end
            ).scalar() or 0
            users = db.query(func.count(func.distinct(models.PlayHistory.user_id))).filter(
                models.PlayHistory.played_at >= week_start,
                models.PlayHistory.played_at < week_end
            ).scalar() or 0
            points.append({"label": f"W{12 - i}", "streams": streams, "users": users})
        return points

    elif range == '1y':
        points = []
        for i in range(11, -1, -1):
            end = now - timedelta(days=i * 30)
            start = end - timedelta(days=30)
            streams = db.query(func.count(models.PlayHistory.id)).filter(
                models.PlayHistory.played_at >= start,
                models.PlayHistory.played_at < end
            ).scalar() or 0
            users = db.query(func.count(func.distinct(models.PlayHistory.user_id))).filter(
                models.PlayHistory.played_at >= start,
                models.PlayHistory.played_at < end
            ).scalar() or 0
            points.append({"label": end.strftime("%b"), "streams": streams, "users": users})
        return points

    else:
        return stream_activity('7d', db)