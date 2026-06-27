import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Cloudinary config - your credentials
cloudinary.config(
    cloud_name="djlnqcwmz",
    api_key="437893188264331",
    api_secret="WmON-jwFsJJRO8WsE7yuGPGrxNs",
    secure=True
)

# Folder mapping for your app
FOLDERS = {
    "audio": "turkana-music/audio",
    "covers": "turkana-music/covers",
    "images": "turkana-music/images"
}

async def upload_file(upload_file: UploadFile, folder: str) -> str:
    """Upload file to Cloudinary and return public URL"""
    
    content_type = upload_file.content_type or ""
    filename = upload_file.filename or "unknown"
    
    logger.info(f"Uploading file: {filename}, type: {content_type}, to folder: {folder}")
    
    if folder == "audio":
        allowed = {"audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg", "audio/x-m4a", "audio/m4a", "audio/webm", "audio/flac"}
        resource_type = "video"  # Cloudinary uses "video" for audio files
        max_size = 50 * 1024 * 1024  # 50MB
    else:
        allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"}
        resource_type = "image"
        max_size = 5 * 1024 * 1024  # 5MB
    
    if content_type not in allowed:
        logger.error(f"Invalid file type: {content_type}. Allowed: {allowed}")
        raise HTTPException(400, f"Invalid file type: {content_type}. Allowed: {', '.join(allowed)}")
    
    # Read and validate
    await upload_file.seek(0)
    contents = await upload_file.read()
    
    if len(contents) == 0:
        raise HTTPException(400, "Uploaded file is empty")
    if len(contents) > max_size:
        raise HTTPException(400, f"File too large ({len(contents) / 1024 / 1024:.1f}MB). Max: {max_size // 1024 // 1024}MB")
    
    logger.info(f"File size: {len(contents)} bytes, uploading to Cloudinary...")
    
    # Upload to Cloudinary
    try:
        result = cloudinary.uploader.upload(
            contents,
            folder=FOLDERS.get(folder, "turkana-music/misc"),
            resource_type=resource_type,
            use_filename=False,
            unique_filename=True,
            overwrite=False
        )
        logger.info(f"Cloudinary upload successful: {result.get('secure_url')}")
        return result["secure_url"]
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {str(e)}")
        raise HTTPException(500, f"Upload failed: {str(e)}")

async def delete_file(file_url: str):
    """Delete file from Cloudinary by URL"""
    if not file_url or "res.cloudinary.com" not in file_url:
        return
    
    try:
        # Extract public_id from Cloudinary URL
        parts = file_url.split("/upload/")
        if len(parts) != 2:
            return
        
        public_id_with_version = parts[1]
        path_parts = public_id_with_version.split("/")
        
        if path_parts[0].startswith("v") and path_parts[0][1:].isdigit():
            public_id = "/".join(path_parts[1:])
        else:
            public_id = public_id_with_version
        
        public_id = ".".join(public_id.split(".")[:-1]) if "." in public_id else public_id
        
        resource_type = "video" if "/video/" in file_url else "image"
        
        cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        logger.info(f"Deleted from Cloudinary: {public_id}")
    except Exception as e:
        logger.error(f"Failed to delete from Cloudinary: {e}")