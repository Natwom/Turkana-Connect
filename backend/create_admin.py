# create_admin.py
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, engine
from app import models, auth

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Check if admin exists
existing = db.query(models.User).filter(models.User.email == "admin@turkana.music").first()
if existing:
    print("Admin already exists!")
    print(f"Email: {existing.email}")
    print(f"Role: {existing.role}")
    db.close()
    exit()

# Create admin
admin = models.User(
    email="admin@turkana.music",
    username="admin",
    hashed_password=auth.get_password_hash("admin123"),
    full_name="System Administrator",
    role="admin",
    is_active=True,
    is_verified=True
)

db.add(admin)
db.commit()
db.refresh(admin)

print("✅ Admin created successfully!")
print(f"Email: admin@turkana.music")
print(f"Password: admin123")
print(f"Role: {admin.role}")

db.close()