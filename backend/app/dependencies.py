from fastapi import UploadFile
from app.storage import upload_file as cloudinary_upload, delete_file as cloudinary_delete

async def save_upload_file(upload_file: UploadFile, folder: str) -> str:
    """Upload file to Cloudinary"""
    return await cloudinary_upload(upload_file, folder)

async def delete_upload_file(file_url: str):
    """Delete file from Cloudinary"""
    await cloudinary_delete(file_url)