from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Student(db.Model):
    __tablename__ = 'Students'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    department = db.Column(db.String(100))
    cgpa = db.Column(db.Numeric(3, 2))
    skills = db.Column(db.Text)
    resume_url = db.Column(db.Text)
    profile_picture = db.Column(db.Text)
    linkedin_url = db.Column(db.Text)
    github_url = db.Column(db.Text)
    bio = db.Column(db.Text)
    approved_status = db.Column(db.Enum('pending', 'approved', 'rejected'), default='pending')
    resume_visibility = db.Column(db.Enum('all', 'applied', 'private'), default='all')
    graduation_year = db.Column(db.Integer)
    backlogs = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, server_default=db.func.current_timestamp(), server_onupdate=db.func.current_timestamp())

class Company(db.Model):
    __tablename__ = 'Companies'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    industry = db.Column(db.String(100))
    description = db.Column(db.Text)
    profile_picture = db.Column(db.Text)
    approved_status = db.Column(db.Enum('pending', 'approved', 'rejected'), default='pending')
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, server_default=db.func.current_timestamp(), server_onupdate=db.func.current_timestamp())

class PlacementDrive(db.Model):
    __tablename__ = 'PlacementDrives'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_id = db.Column(db.Integer, db.ForeignKey('Companies.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    eligibility_cgpa = db.Column(db.Numeric(3, 2))
    eligibility_branches = db.Column(db.String(255))
    eligibility_skills = db.Column(db.Text)
    eligibility_year = db.Column(db.Integer)
    eligibility_backlogs = db.Column(db.Integer)
    deadline = db.Column(db.Date)
    interview_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, server_default=db.func.current_timestamp(), server_onupdate=db.func.current_timestamp())
    company = db.relationship('Company', backref=db.backref('drives', lazy=True, cascade='all, delete-orphan'))

class Application(db.Model):
    __tablename__ = 'Applications'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('Students.id', ondelete='CASCADE'), nullable=False)
    drive_id = db.Column(db.Integer, db.ForeignKey('PlacementDrives.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.Enum('applied', 'shortlisted', 'rejected', 'selected'), default='applied')
    applied_date = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, server_default=db.func.current_timestamp(), server_onupdate=db.func.current_timestamp())
    student = db.relationship('Student', backref=db.backref('applications', lazy=True, cascade='all, delete-orphan'))
    drive = db.relationship('PlacementDrive', backref=db.backref('applications', lazy=True, cascade='all, delete-orphan'))

class Notification(db.Model):
    __tablename__ = 'Notifications'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    role = db.Column(db.Enum('student', 'company', 'admin'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())

class Admin(db.Model):
    __tablename__ = 'Admin'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    role = db.Column(db.Enum('student', 'company', 'admin'), nullable=False)
    action = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.current_timestamp())

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    role = db.Column(db.Enum('admin', 'company', 'student'), nullable=False)
    action = db.Column(db.Text, nullable=False)
    details = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, server_default=db.func.current_timestamp())

class InterviewSlot(db.Model):
    __tablename__ = 'interview_slots'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    drive_id = db.Column(db.Integer, db.ForeignKey('PlacementDrives.id', ondelete='CASCADE'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('Companies.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('Students.id', ondelete='SET NULL'), nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum('available', 'booked'), default='available')
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    drive = db.relationship('PlacementDrive', backref=db.backref('interview_slots', lazy=True, cascade='all, delete-orphan'))
    company = db.relationship('Company', backref=db.backref('interview_slots', lazy=True, cascade='all, delete-orphan'))
    student = db.relationship('Student', backref=db.backref('interview_slots', lazy=True))

class Bookmark(db.Model):
    __tablename__ = 'bookmarks'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('Students.id', ondelete='CASCADE'), nullable=False)
    drive_id = db.Column(db.Integer, db.ForeignKey('PlacementDrives.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    student = db.relationship('Student', backref=db.backref('bookmarks', lazy=True, cascade='all, delete-orphan'))
    drive = db.relationship('PlacementDrive', backref=db.backref('bookmarks', lazy=True, cascade='all, delete-orphan'))

class ResumeDownloadLog(db.Model):
    __tablename__ = 'resume_download_logs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_id = db.Column(db.Integer, db.ForeignKey('Companies.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('Students.id', ondelete='CASCADE'), nullable=False)
    downloaded_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())
    company = db.relationship('Company', backref=db.backref('resume_downloads', lazy=True, cascade='all, delete-orphan'))
    student = db.relationship('Student', backref=db.backref('resume_downloads', lazy=True, cascade='all, delete-orphan'))
