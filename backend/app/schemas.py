from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    is_verified: bool
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[int] = None
    refresh_token: Optional[str] = None

# User Settings schemas
class UserSettingsBase(BaseModel):
    push_notifications: Optional[bool] = True
    email_notifications: Optional[bool] = True
    new_release_alerts: Optional[bool] = True
    artist_updates: Optional[bool] = False
    playlist_collabs: Optional[bool] = True
    marketing_emails: Optional[bool] = False
    audio_quality: Optional[str] = "high"
    crossfade: Optional[bool] = True
    crossfade_duration: Optional[int] = 5
    normalize_volume: Optional[bool] = True
    autoplay: Optional[bool] = True
    gapless_playback: Optional[bool] = False
    theme: Optional[str] = "dark"
    compact_mode: Optional[bool] = False
    show_lyrics: Optional[bool] = True
    animations: Optional[bool] = True
    font_size: Optional[str] = "medium"
    private_profile: Optional[bool] = False
    activity_sharing: Optional[bool] = True
    listening_history: Optional[bool] = True
    show_followers: Optional[bool] = True
    allow_messages: Optional[str] = "everyone"
    two_factor: Optional[bool] = False
    login_alerts: Optional[bool] = True
    language: Optional[str] = "en"

class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    push_notifications: Optional[bool] = None
    email_notifications: Optional[bool] = None
    new_release_alerts: Optional[bool] = None
    artist_updates: Optional[bool] = None
    playlist_collabs: Optional[bool] = None
    marketing_emails: Optional[bool] = None
    audio_quality: Optional[str] = None
    crossfade: Optional[bool] = None
    crossfade_duration: Optional[int] = None
    normalize_volume: Optional[bool] = None
    autoplay: Optional[bool] = None
    gapless_playback: Optional[bool] = None
    theme: Optional[str] = None
    compact_mode: Optional[bool] = None
    show_lyrics: Optional[bool] = None
    animations: Optional[bool] = None
    font_size: Optional[str] = None
    private_profile: Optional[bool] = None
    activity_sharing: Optional[bool] = None
    listening_history: Optional[bool] = None
    show_followers: Optional[bool] = None
    allow_messages: Optional[str] = None
    two_factor: Optional[bool] = None
    login_alerts: Optional[bool] = None
    language: Optional[str] = None

# Artist schemas
class ArtistBase(BaseModel):
    stage_name: str
    bio: Optional[str] = None
    genre: Optional[str] = None
    country: Optional[str] = "Kenya"
    region: Optional[str] = "Turkana"

class ArtistCreate(ArtistBase):
    pass

class ArtistResponse(ArtistBase):
    id: int
    user_id: int
    image_url: Optional[str] = None
    is_verified: bool
    is_approved: bool
    followers_count: int
    total_streams: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ArtistDetail(ArtistResponse):
    songs: List['SongResponse'] = []
    albums: List['AlbumResponse'] = []

# Category schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    color: Optional[str] = "#7C3AED"

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    image_url: Optional[str] = None
    is_active: bool
    
    class Config:
        from_attributes = True

# Album schemas
class AlbumBase(BaseModel):
    title: str
    release_date: Optional[datetime] = None
    description: Optional[str] = None
    is_single: bool = False

class AlbumCreate(AlbumBase):
    pass

class AlbumResponse(AlbumBase):
    id: int
    artist_id: int
    cover_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AlbumDetail(AlbumResponse):
    artist: Optional[ArtistResponse] = None
    songs: List['SongResponse'] = []

# Song schemas
class SongBase(BaseModel):
    title: str
    duration: Optional[int] = 0
    lyrics: Optional[str] = None
    is_explicit: bool = False

class SongCreate(SongBase):
    album_id: Optional[int] = None
    category_id: Optional[int] = None

class SongResponse(SongBase):
    id: int
    artist_id: Optional[int] = None   # ← FIXED: was `int`, now `Optional[int]`
    album_id: Optional[int] = None
    category_id: Optional[int] = None
    audio_url: Optional[str] = None   # ← FIXED: was `str`, now `Optional[str]`
    cover_url: Optional[str] = None
    is_approved: bool
    play_count: int
    likes_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SongDetail(SongResponse):
    artist: Optional[ArtistResponse] = None
    album: Optional[AlbumResponse] = None
    category: Optional[CategoryResponse] = None

# Playlist schemas
class PlaylistBase(BaseModel):
    name: str
    is_public: bool = True

class PlaylistCreate(PlaylistBase):
    pass

class PlaylistResponse(PlaylistBase):
    id: int
    user_id: int
    cover_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class PlaylistDetail(PlaylistResponse):
    songs: List[SongResponse] = []

# Like, Follow, Comment schemas
class LikeResponse(BaseModel):
    id: int
    user_id: int
    song_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class FollowResponse(BaseModel):
    id: int
    follower_id: int
    artist_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    user_id: int
    song_id: int
    created_at: datetime
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# Play History
class PlayHistoryResponse(BaseModel):
    id: int
    song_id: int
    played_at: datetime
    duration_played: int
    song: Optional[SongResponse] = None
    
    class Config:
        from_attributes = True

# Notification
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: Optional[str] = None
    type: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Report
class ReportCreate(BaseModel):
    content_type: str
    content_id: int
    reason: str

class ReportResponse(ReportCreate):
    id: int
    reporter_id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Admin schemas
class DashboardStats(BaseModel):
    total_users: int
    total_artists: int
    total_songs: int
    total_streams: int
    pending_approvals: int
    recent_reports: int

class AdminLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Search
class SearchResult(BaseModel):
    songs: List[SongResponse] = []
    artists: List[ArtistResponse] = []
    albums: List[AlbumResponse] = []
    playlists: List[PlaylistResponse] = []

# Update forward references
ArtistDetail.model_rebuild()
AlbumDetail.model_rebuild()
SongDetail.model_rebuild()
PlaylistDetail.model_rebuild()