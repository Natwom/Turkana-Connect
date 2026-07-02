from sqlalchemy.orm import Session, joinedload
from app import models
from typing import Optional

class NotificationService:
    @staticmethod
    def create(
        db: Session,
        user_id: int,
        title: str,
        message: Optional[str] = None,
        notification_type: str = "general"
    ) -> models.Notification:
        """Create a notification for a user."""
        notification = models.Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            is_read=False
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def create_like_notification(db: Session, like: models.Like) -> None:
        """Notify artist when someone likes their song."""
        song = like.song
        if not song or not song.artist:
            return
        
        artist_user_id = song.artist.user_id
        if artist_user_id == like.user_id:
            return
        
        username = like.user.username if like.user else "Someone"
        
        NotificationService.create(
            db=db,
            user_id=artist_user_id,
            title=f"New like on '{song.title}'",
            message=f"{username} liked your song.",
            notification_type="like"
        )

    @staticmethod
    def create_follow_notification(db: Session, follow: models.Follow) -> None:
        """Notify artist when someone follows them."""
        artist = follow.artist
        if not artist:
            return
        
        if artist.user_id == follow.follower_id:
            return
        
        follower = follow.follower
        username = follower.username if follower else "Someone"
        
        NotificationService.create(
            db=db,
            user_id=artist.user_id,
            title="New follower",
            message=f"{username} started following you.",
            notification_type="follow"
        )

    @staticmethod
    def create_approval_notification(
        db: Session,
        artist: models.Artist,
        content_type: str,
        content_title: str
    ) -> None:
        """Notify artist when their content is approved."""
        NotificationService.create(
            db=db,
            user_id=artist.user_id,
            title=f"Your {content_type} was approved!",
            message=f"'{content_title}' is now live on Apiaro.",
            notification_type="approval"
        )

    @staticmethod
    def create_comment_notification(db: Session, comment: models.Comment) -> None:
        """Notify artist when someone comments on their song."""
        song = comment.song
        if not song or not song.artist:
            return
        
        if song.artist.user_id == comment.user_id:
            return
        
        username = comment.user.username if comment.user else "Someone"
        content_preview = comment.content[:60] + "..." if len(comment.content) > 60 else comment.content
        
        NotificationService.create(
            db=db,
            user_id=song.artist.user_id,
            title=f"New comment on '{song.title}'",
            message=f"{username}: {content_preview}",
            notification_type="comment"
        )

    @staticmethod
    def create_new_release_notification(
        db: Session,
        artist: models.Artist,
        song: models.Song
    ) -> None:
        """Notify all followers when artist drops a new song."""
        follows = db.query(models.Follow).options(
            joinedload(models.Follow.follower).joinedload(models.User.settings)
        ).filter(
            models.Follow.artist_id == artist.id
        ).all()
        
        for follow in follows:
            user_settings = follow.follower.settings if follow.follower else None
            if user_settings and not user_settings.new_release_alerts:
                continue
            
            NotificationService.create(
                db=db,
                user_id=follow.follower_id,
                title=f"New release from {artist.stage_name}",
                message=f"'{song.title}' is now available. Check it out!",
                notification_type="new_release"
            )

    @staticmethod
    def create_welcome_notification(db: Session, user_id: int) -> None:
        """Send welcome notification to new users."""
        NotificationService.create(
            db=db,
            user_id=user_id,
            title="Welcome to Apiaro!",
            message="Discover Turkana's finest music. Start exploring artists and playlists.",
            notification_type="general"
        )

    @staticmethod
    def create_artist_application_notification(db: Session, user: models.User) -> None:
        """Notify admins when someone applies to become an artist."""
        admins = db.query(models.User).filter(models.User.role == "admin").all()
        for admin in admins:
            NotificationService.create(
                db=db,
                user_id=admin.id,
                title="New artist application",
                message=f"{user.username} applied to become an artist.",
                notification_type="admin_alert"
            )

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """Mark all unread notifications as read for a user. Returns count."""
        notifications = db.query(models.Notification).filter(
            models.Notification.user_id == user_id,
            models.Notification.is_read == False
        ).all()
        
        count = 0
        for notif in notifications:
            notif.is_read = True
            count += 1
        
        db.commit()
        return count