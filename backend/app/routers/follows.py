from fastapi import APIRouter
from app import auth

router = APIRouter(prefix="/follows", tags=["Follows"])
# Follow logic is in artists.py to avoid circular imports