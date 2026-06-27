from fastapi import UploadFile
from app.storage import upload_file, delete_file

async def save_upload_file(upload_file: UploadFile, folder: str) -> str:
    """Upload file to Cloudinary"""
    return await upload_file(upload_file, folder)

async def delete_upload_file(file_url: str):
    """Delete file from Cloudinary"""
    await delete_file(file_url)