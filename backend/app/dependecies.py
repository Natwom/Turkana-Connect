from fastapi import UploadFile, HTTPException
from app.config import settings
import os
import uuid
from pathlib import Path

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
AUDIO_DIR = UPLOAD_DIR / "audio"
IMAGES_DIR = UPLOAD_DIR / "images"
COVERS_DIR = UPLOAD_DIR / "covers"

for d in [AUDIO_DIR, IMAGES_DIR, COVERS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

async def save_upload_file(upload_file: UploadFile, folder: str) -> str:
    if folder == "audio":
        target_dir = AUDIO_DIR
        max_size = settings.MAX_AUDIO_SIZE
        allowed = {"audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg", "audio/x-m4a"}
    elif folder == "covers":
        target_dir = COVERS_DIR
        max_size = settings.MAX_IMAGE_SIZE
        allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    else:
        target_dir = IMAGES_DIR
        max_size = settings.MAX_IMAGE_SIZE
        allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    
    content_type = upload_file.content_type
    if content_type not in allowed:
        raise HTTPException(400, f"Invalid file type: {content_type}. Allowed: {allowed}")
    
    contents = await upload_file.read()
    if len(contents) > max_size:
        raise HTTPException(400, f"File too large. Max size: {max_size // 1024 // 1024}MB")
    
    ext = upload_file.filename.split(".")[-1] if "." in upload_file.filename else "bin"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = target_dir / filename
    
    with open(filepath, "wb") as f:
        f.write(contents)
    
    return f"/uploads/{folder}/{filename}"