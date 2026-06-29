from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import (
    auth, users, artists, songs, albums, playlists,
    categories, likes, follows, comments, search,
    streaming, notifications, admin, analytics
)
from app import models

# Create tables
Base.metadata.create_all(bind=engine)

def seed_categories():
    """Seed default categories if none exist"""
    db = SessionLocal()
    try:
        existing = db.query(models.Category).count()
        if existing == 0:
            default_categories = [
                models.Category(name="Turkana", slug="turkana", description="Traditional Turkana music", color="#E63946"),
                models.Category(name="Kenyan", slug="kenyan", description="Popular Kenyan music", color="#F4A261"),
                models.Category(name="Gospel", slug="gospel", description="Gospel and worship music", color="#2A9D8F"),
                models.Category(name="Traditional", slug="traditional", description="Traditional African music", color="#E9C46A"),
                models.Category(name="Afrobeat", slug="afrobeat", description="Afrobeat and contemporary", color="#264653"),
                models.Category(name="Contemporary", slug="contemporary", description="Modern and pop music", color="#6A4C93"),
            ]
            db.add_all(default_categories)
            db.commit()
            print("✅ Categories seeded successfully")
        else:
            print(f"ℹ️ {existing} categories already exist, skipping seed")
    except Exception as e:
        print(f"❌ Error seeding categories: {e}")
        db.rollback()
    finally:
        db.close()

def seed_admin():
    """Create default admin user if none exists"""
    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.role == "admin").first()
        if not existing:
            from app.auth import get_password_hash
            admin = models.User(
                email="admin@turkana.music",
                username="admin",
                full_name="System Administrator",
                hashed_password=get_password_hash("AdminPass123!"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ Admin user created: admin@turkana.music / AdminPass123!")
        else:
            print(f"ℹ️ Admin user already exists: {existing.email}")
    except Exception as e:
        print(f"❌ Error seeding admin: {e}")
        db.rollback()
    finally:
        db.close()

# Run seeds on startup
seed_categories()
seed_admin()

app = FastAPI(
    title="Turkana Music Hub API",
    description="Production-ready music streaming platform API",
    version="1.0.0"
)

# CORS - Updated for production
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://apiaro-music.onrender.com",           # ← YOUR FRONTEND
    "https://turkana-connect-api.onrender.com",    # your API
    "https://turkana-connect-admin.onrender.com",  # your admin
    "https://apiaro-music-admin.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FIX: Only mount static files if directory exists (for local dev)
upload_dir = settings.UPLOAD_DIR
if os.path.isdir(upload_dir):
    app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")
    print(f"📁 Static files mounted at /uploads from {upload_dir}")
else:
    print(f"⚠️ Upload directory '{upload_dir}' not found. Skipping static mount. Using Cloudinary for file storage.")

# API routes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(artists.router, prefix="/api/v1")
app.include_router(songs.router, prefix="/api/v1")
app.include_router(albums.router, prefix="/api/v1")
app.include_router(playlists.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(likes.router, prefix="/api/v1")
app.include_router(follows.router, prefix="/api/v1")
app.include_router(comments.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(streaming.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Turkana Music Hub API"}

@app.get("/")
def root():
    return {
        "message": "Welcome to Turkana Music Hub API",
        "docs": "/docs",
        "version": "1.0.0"
    }