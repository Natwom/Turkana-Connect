from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Table, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Association tables
playlist_songs = Table(
    'playlist_songs', Base.metadata,
    Column('playlist_id', Integer, ForeignKey('playlists.id'), primary_key=True),
    Column('song_id', Integer, ForeignKey('songs.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200))
    bio = Column(Text)
    avatar_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    role = Column(String(20), default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    playlists = relationship("Playlist", back_populates="user")
    likes = relationship("Like", back_populates="user")
    follows = relationship("Follow", foreign_keys="Follow.follower_id", back_populates="follower")
    comments = relationship("Comment", back_populates="user")
    play_history = relationship("PlayHistory", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    artist_profile = relationship("Artist", back_populates="user", uselist=False)
    settings = relationship("UserSettings", back_populates="user", uselist=False)

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Notifications
    push_notifications = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    new_release_alerts = Column(Boolean, default=True)
    artist_updates = Column(Boolean, default=False)
    playlist_collabs = Column(Boolean, default=True)
    marketing_emails = Column(Boolean, default=False)
    
    # Playback
    audio_quality = Column(String(20), default="high")
    crossfade = Column(Boolean, default=True)
    crossfade_duration = Column(Integer, default=5)
    normalize_volume = Column(Boolean, default=True)
    autoplay = Column(Boolean, default=True)
    gapless_playback = Column(Boolean, default=False)
    
    # Appearance
    theme = Column(String(20), default="dark")
    compact_mode = Column(Boolean, default=False)
    show_lyrics = Column(Boolean, default=True)
    animations = Column(Boolean, default=True)
    font_size = Column(String(20), default="medium")
    
    # Privacy
    private_profile = Column(Boolean, default=False)
    activity_sharing = Column(Boolean, default=True)
    listening_history = Column(Boolean, default=True)
    show_followers = Column(Boolean, default=True)
    allow_messages = Column(String(20), default="everyone")
    
    # Security
    two_factor = Column(Boolean, default=False)
    login_alerts = Column(Boolean, default=True)
    
    # Language
    language = Column(String(10), default="en")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="settings")

class Artist(Base):
    __tablename__ = "artists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    stage_name = Column(String(200), nullable=False)
    bio = Column(Text)
    genre = Column(String(100))
    country = Column(String(100), default="Kenya")
    region = Column(String(100), default="Turkana")
    image_url = Column(String(500))
    is_verified = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    followers_count = Column(Integer, default=0)
    total_streams = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="artist_profile")
    songs = relationship("Song", back_populates="artist")
    albums = relationship("Album", back_populates="artist")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    image_url = Column(String(500))
    color = Column(String(7), default="#7C3AED")
    is_active = Column(Boolean, default=True)
    
    songs = relationship("Song", back_populates="category")

class Album(Base):
    __tablename__ = "albums"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    artist_id = Column(Integer, ForeignKey("artists.id"))
    cover_url = Column(String(500))
    release_date = Column(DateTime(timezone=True))
    description = Column(Text)
    is_single = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    artist = relationship("Artist", back_populates="albums")
    songs = relationship("Song", back_populates="album")

class Song(Base):
    __tablename__ = "songs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    artist_id = Column(Integer, ForeignKey("artists.id"))
    album_id = Column(Integer, ForeignKey("albums.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    audio_url = Column(String(500), nullable=False)
    cover_url = Column(String(500))
    duration = Column(Integer, default=0)
    lyrics = Column(Text)
    is_approved = Column(Boolean, default=False)
    is_explicit = Column(Boolean, default=False)
    play_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    artist = relationship("Artist", back_populates="songs")
    album = relationship("Album", back_populates="songs")
    category = relationship("Category", back_populates="songs")
    likes = relationship("Like", back_populates="song")
    comments = relationship("Comment", back_populates="song")
    play_history = relationship("PlayHistory", back_populates="song")

class Playlist(Base):
    __tablename__ = "playlists"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    cover_url = Column(String(500))
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="playlists")
    songs = relationship("Song", secondary=playlist_songs, backref="playlists")

class Like(Base):
    __tablename__ = "likes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    song_id = Column(Integer, ForeignKey("songs.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="likes")
    song = relationship("Song", back_populates="likes")

class Follow(Base):
    __tablename__ = "follows"
    
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"))
    artist_id = Column(Integer, ForeignKey("artists.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    follower = relationship("User", foreign_keys=[follower_id], back_populates="follows")
    artist = relationship("Artist")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    song_id = Column(Integer, ForeignKey("songs.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="comments")
    song = relationship("Song", back_populates="comments")

class PlayHistory(Base):
    __tablename__ = "play_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    song_id = Column(Integer, ForeignKey("songs.id"))
    played_at = Column(DateTime(timezone=True), server_default=func.now())
    duration_played = Column(Integer, default=0)
    
    user = relationship("User", back_populates="play_history")
    song = relationship("Song", back_populates="play_history")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    message = Column(Text)
    type = Column(String(50), default="general")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="notifications")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"))
    content_type = Column(String(50), nullable=False)
    content_id = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AdminLog(Base):
    __tablename__ = "admin_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50))
    entity_id = Column(Integer)
    details = Column(Text)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), server_default=func.now())