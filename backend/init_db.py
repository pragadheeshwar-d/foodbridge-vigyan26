"""
Database initialization script.
Creates all tables and seeds an admin user.

Usage:
    cd backend
    .\\venv\\Scripts\\python init_db.py      (Windows)
    source venv/bin/activate && python init_db.py  (Linux/Mac)
"""
from app import create_app
from extensions import db
from models import User
import bcrypt

app = create_app()

with app.app_context():
    db.create_all()
    print("✅ All database tables created.")

    admin = User.query.filter_by(email='admin@foodbridge.com').first()
    if not admin:
        hashed = bcrypt.hashpw(b'Admin@1234', bcrypt.gensalt()).decode()
        admin = User(
            name='FoodBridge Admin',
            email='admin@foodbridge.com',
            password=hashed,
            role='super_admin',
            organization='FoodBridge',
            verified=True,
            status='approved',
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created  →  admin@foodbridge.com  /  Admin@1234")
    else:
        print("ℹ️  Admin user already exists.")

    print("✅ Database initialization complete.")
