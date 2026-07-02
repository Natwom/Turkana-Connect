from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
from app.services.notification import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[schemas.NotificationResponse])
def get_notifications(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()

@router.post("/{notification_id}/read")
def mark_read(
    notification_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Marked as read"}

@router.post("/read-all")
def mark_all_read(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    count = NotificationService.mark_all_as_read(db, current_user.id)
    return {"message": f"Marked {count} notifications as read"}