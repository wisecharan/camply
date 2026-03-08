import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from run import create_app
from app.models import db, Admin
from werkzeug.security import generate_password_hash

print("Starting seed script...")
app = create_app()

with app.app_context():
    print("Creating tables if they don't exist...")
    db.create_all()
    print("Tables ready.")

    # Check if admin already exists
    admin = Admin.query.filter_by(username='admin').first()
    if not admin:
        hashed_pw = generate_password_hash('admin123')
        new_admin = Admin(username='admin', password=hashed_pw)
        db.session.add(new_admin)
        db.session.commit()
        print("\nAdmin created successfully!")
        print("   Username: admin")
        print("   Password: admin123")
    else:
        # Reset the password in case it's wrong
        admin.password = generate_password_hash('admin123')
        db.session.commit()
        print("\nAdmin already exists - password has been reset to 'admin123'")
