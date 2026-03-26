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

    # Check if admin already exists using the new 'email' field
    admin = Admin.query.filter_by(email='admin@campusplacement.com').first()
    
    # Just in case you had an old one saved simply as 'admin'
    if not admin:
        admin = Admin.query.filter_by(email='admin').first()

    if not admin:
        hashed_pw = generate_password_hash('admin123')
        # Creating the admin using the 'email' field
        new_admin = Admin(email='admin@campusplacement.com', password=hashed_pw)
        db.session.add(new_admin)
        db.session.commit()
        print("\nAdmin created successfully!")
        print("   Email: admin@campusplacement.com")
        print("   Password: admin123")
    else:
        # Reset the password in case it's wrong
        admin.password = generate_password_hash('admin123')
        db.session.commit()
        print(f"\nAdmin already exists - password has been reset to 'admin123' for {admin.email}")