# 🎵 Apiaro Music

A production-ready music streaming platform built with **FastAPI**, **React**, and **PostgreSQL**. Apiaro Music enables artists to upload and share their music while giving listeners a beautiful, immersive streaming experience.

## ✨ Features

- **🎧 Music Streaming** — High-quality audio streaming with a custom-built player
- **🎤 Artist Profiles** — Dedicated pages for artists with discographies and bios
- **📁 Albums & Playlists** — Organize music into albums and user-curated playlists
- **❤️ Social Features** — Like songs, follow artists, comment, and share
- **🔍 Smart Search** — Find songs, artists, and albums instantly
- **🔐 Authentication** — Secure JWT-based auth with role-based access control
- **📊 Admin Dashboard** — Full analytics, user management, and content moderation
- **☁️ Cloud Storage** — Audio and image uploads via Cloudinary
- **📱 Responsive Design** — Works beautifully on desktop and mobile

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, SQLAlchemy, Alembic, PostgreSQL |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React |
| **Admin** | React 18, Recharts, Tailwind CSS |
| **Storage** | Cloudinary (production), local filesystem (development) |
| **Deployment** | Docker, Docker Compose, Render |

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/yourusername/apiaro-music.git
cd apiaro-music

# Start all services
docker-compose up --build

# Access the apps
# Frontend:  http://localhost:5173
# Admin:     http://localhost:5174
# API Docs:  http://localhost:8000/docs