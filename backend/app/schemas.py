from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# ============ USER SCHEMAS ============

class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    role: str = "user"
    created_at: Optional[datetime] = None

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

# ============ ARTIST SCHEMAS ============

class ArtistBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    stage_name: str
    bio: Optional[str] = None
    genre: Optional[str] = None
    country: Optional[str] = "Kenya"
    region: Optional[str] = "Turkana"

class ArtistCreate(ArtistBase):
    pass

class ArtistResponse(ArtistBase):
    id: int
    user_id: Optional[int] = None
    image_url: Optional[str] = None
    is_verified: bool = False
    is_approved: bool = False
    followers_count: int = 0
    total_streams: int = 0
    created_at: Optional[datetime] = None

# ============ CATEGORY SCHEMAS ============

class CategoryBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    slug: str
    description: Optional[str] = None
    color: Optional[str] = "#7C3AED"

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    image_url: Optional[str] = None
    is_active: bool = True

# ============ ALBUM SCHEMAS ============

class AlbumBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: str
    release_date: Optional[datetime] = None
    description: Optional[str] = None
    is_single: bool = False

class AlbumCreate(AlbumBase):
    pass

class AlbumResponse(AlbumBase):
    id: int
    artist_id: Optional[int] = None
    cover_url: Optional[str] = None
    created_at: Optional[datetime] = None

# ============ SONG SCHEMAS ============

class SongBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: str
    duration: Optional[int] = 0
    lyrics: Optional[str] = None
    is_explicit: bool = False

class SongCreate(SongBase):
    album_id: Optional[int] = None
    category_id: Optional[int] = None

class SongResponse(SongBase):
    id: int
    artist_id: Optional[int] = None
    artist_name: Optional[str] = None
    album_id: Optional[int] = None
    category_id: Optional[int] = None
    audio_url: Optional[str] = None
    cover_url: Optional[str] = None
    is_approved: bool = False
    play_count: int = 0
    likes_count: int = 0
    created_at: Optional[datetime] = None

# ============ DETAIL SCHEMAS (with relationships) ============

class ArtistDetail(ArtistResponse):
    songs: List['SongResponse'] = []
    albums: List['AlbumResponse'] = []

class AlbumDetail(AlbumResponse):
    artist: Optional['ArtistResponse'] = None
    songs: List['SongResponse'] = []

class SongDetail(SongResponse):
    artist: Optional['ArtistResponse'] = None
    album: Optional['AlbumResponse'] = None
    category: Optional['CategoryResponse'] = None

# ============ ARTIST DASHBOARD (OWN PROFILE) ============

class ArtistDashboard(ArtistDetail):
    total_songs: int = 0
    total_albums: int = 0
    total_streams: int = 0
    total_likes: int = 0
    pending_songs: int = 0
    monthly_listeners: int = 0

# ============ PLAYLIST SCHEMAS ============

class PlaylistBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    is_public: bool = True

class PlaylistCreate(PlaylistBase):
    pass

class PlaylistResponse(PlaylistBase):
    id: int
    user_id: int
    cover_url: Optional[str] = None
    created_at: Optional[datetime] = None

class PlaylistDetail(PlaylistResponse):
    songs: List['SongResponse'] = []

# ============ LIKE, FOLLOW, COMMENT SCHEMAS ============

class LikeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    song_id: int
    created_at: Optional[datetime] = None

class FollowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    follower_id: int
    artist_id: int
    created_at: Optional[datetime] = None

class CommentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    user_id: int
    song_id: int
    created_at: Optional[datetime] = None
    user: Optional['UserResponse'] = None

# ============ PLAY HISTORY ============

class PlayHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    song_id: int
    played_at: Optional[datetime] = None
    duration_played: int = 0
    song: Optional['SongResponse'] = None

# ============ NOTIFICATION ============

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    message: Optional[str] = None
    type: str = "general"
    is_read: bool = False
    created_at: Optional[datetime] = None

# ============ REPORT ============

class ReportCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    content_type: str
    content_id: int
    reason: str

class ReportResponse(ReportCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    reporter_id: int
    status: str = "pending"
    created_at: Optional[datetime] = None

# ============ ADMIN SCHEMAS ============

class DashboardStats(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    total_users: int = 0
    total_artists: int = 0
    total_songs: int = 0
    total_streams: int = 0
    pending_approvals: int = 0
    recent_reports: int = 0

class AdminLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    admin_id: int
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[str] = None
    created_at: Optional[datetime] = None

# ============ USER SETTINGS SCHEMAS ============

class UserSettingsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
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
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class UserSettingsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
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

# ============ SEARCH ============

class SearchResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    songs: List['SongResponse'] = []
    artists: List['ArtistResponse'] = []
    albums: List['AlbumResponse'] = []
    playlists: List['PlaylistResponse'] = []

# Update forward references
ArtistDetail.model_rebuild()
AlbumDetail.model_rebuild()
SongDetail.model_rebuild()
PlaylistDetail.model_rebuild()
ArtistDashboard.model_rebuild()