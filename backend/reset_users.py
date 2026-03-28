import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from run import create_app
from app.models import (
    db, Student, Company, PlacementDrive, Application, 
    Notification, ActivityLog, AuditLog, InterviewSlot, 
    Bookmark, ResumeDownloadLog
)

app = create_app()

with app.app_context():
    print("Starting database cleanup...")
    try:
        # 1. Delete child tables first to avoid Foreign Key errors
        print("Clearing applications, slots, and bookmarks...")
        Application.query.delete()
        InterviewSlot.query.delete()
        Bookmark.query.delete()
        ResumeDownloadLog.query.delete()
        
        # 2. Delete drives
        print("Deleting company placement drives...")
        PlacementDrive.query.delete()
        
        # 3. Delete the actual Users (Students & Companies)
        print("Deleting all Students and Companies...")
        Student.query.delete()
        Company.query.delete()
        
        # 4. Clear out the logs and notifications so your dashboard is truly fresh
        print("Clearing old activity logs and notifications...")
        ActivityLog.query.delete()
        AuditLog.query.delete()
        Notification.query.delete()
        
        # Save the changes
        db.session.commit()
        
        print("\n✅ SUCCESS: All students, companies, and their related data have been wiped!")
        print("🛡️  Admin accounts remain perfectly intact.")
        
    except Exception as e:
        db.session.rollback()
        print(f"\n❌ ERROR: Something went wrong: {str(e)}")