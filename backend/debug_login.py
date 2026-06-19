# debug_login.py
from app.database import SessionLocal
from app import models, auth

db = SessionLocal()

# Check the admin user
admin = db.query(models.User).filter(models.User.email == "admin@turkana.music").first()

if not admin:
    print("❌ Admin user NOT FOUND in database!")
    print("Run your seeder script first.")
    db.close()
    exit()

print("=" * 50)
print("🔍 ADMIN USER FOUND")
print("=" * 50)
print(f"ID: {admin.id}")
print(f"Email: {admin.email}")
print(f"Username: {admin.username}")
print(f"Role: {admin.role}")
print(f"Is Active: {admin.is_active}")
print(f"Is Verified: {admin.is_verified}")

# Check password field name
print(f"\nPassword field names in model: {[col.name for col in admin.__table__.columns if 'pass' in col.name.lower()]}")
print(f"Has 'password': {hasattr(admin, 'password')}")
print(f"Has 'hashed_password': {hasattr(admin, 'hashed_password')}")

if hasattr(admin, 'password') and admin.password:
    print(f"\npassword value (first 30 chars): {admin.password[:30]}...")
    print(f"Is hashed (starts with $2b$): {admin.password.startswith('$2b$')}")
    # Test verify
    result = auth.verify_password("admin123", admin.password)
    print(f"Verify 'admin123' against 'password': {result}")

if hasattr(admin, 'hashed_password') and admin.hashed_password:
    print(f"\nhashed_password value (first 30 chars): {admin.hashed_password[:30]}...")
    print(f"Is hashed (starts with $2b$): {admin.hashed_password.startswith('$2b$')}")
    # Test verify
    result = auth.verify_password("admin123", admin.hashed_password)
    print(f"Verify 'admin123' against 'hashed_password': {result}")

print("\n" + "=" * 50)
print("🔍 TESTING LOGIN FLOW")
print("=" * 50)

# Simulate what your login endpoint does
test_password = "admin123"

# Try with 'password' field
if hasattr(admin, 'password') and admin.password:
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        valid = pwd_context.verify(test_password, admin.password)
        print(f"✅ pwd_context.verify('{test_password}', admin.password) = {valid}")
    except Exception as e:
        print(f"❌ Error with 'password' field: {e}")

# Try with 'hashed_password' field
if hasattr(admin, 'hashed_password') and admin.hashed_password:
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        valid = pwd_context.verify(test_password, admin.hashed_password)
        print(f"✅ pwd_context.verify('{test_password}', admin.hashed_password) = {valid}")
    except Exception as e:
        print(f"❌ Error with 'hashed_password' field: {e}")

db.close()