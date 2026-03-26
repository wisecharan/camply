from flask import Blueprint, request, jsonify, send_file
from app.models import db, PlacementDrive, Application, Notification, Student, ActivityLog, InterviewSlot, Bookmark, ResumeDownloadLog
from app.middleware.auth import role_required
from flask_jwt_extended import get_jwt_identity
import os
import uuid

student_bp = Blueprint('student', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def log_activity(user_id, role, action):
    try:
        log = ActivityLog(user_id=user_id, role=role, action=action)
        db.session.add(log)
        db.session.commit()
    except:
        pass

@student_bp.route('/profile', methods=['GET'])
@role_required('student')
def get_profile():
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    # Count how many times resume was viewed
    resume_views = ResumeDownloadLog.query.filter_by(student_id=student_id).all()
    resume_view_info = [
        {
            'company_name': rv.company.company_name,
            'downloaded_at': rv.downloaded_at.isoformat()
        }
        for rv in resume_views
    ]

    return jsonify({
        'id': student.id,
        'name': student.name,
        'email': student.email,
        'phone': student.phone,
        'department': student.department,
        'cgpa': float(student.cgpa) if student.cgpa else None,
        'skills': student.skills,
        'resume_url': student.resume_url,
        'profile_picture': student.profile_picture,
        'linkedin_url': student.linkedin_url,
        'github_url': student.github_url,
        'bio': student.bio,
        'approved_status': student.approved_status,
        'resume_visibility': student.resume_visibility,
        'graduation_year': student.graduation_year,
        'backlogs': student.backlogs,
        'resume_views': resume_view_info
    }), 200

@student_bp.route('/profile', methods=['PUT'])
@role_required('student')
def update_profile():
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)
    data = request.get_json()
    
    student.phone = data.get('phone', student.phone)
    student.department = data.get('department', student.department)
    student.skills = data.get('skills', student.skills)
    student.resume_url = data.get('resume_url', student.resume_url)
    student.profile_picture = data.get('profile_picture', student.profile_picture)
    student.linkedin_url = data.get('linkedin_url', student.linkedin_url)
    student.github_url = data.get('github_url', student.github_url)
    student.bio = data.get('bio', student.bio)
    if 'cgpa' in data:
        student.cgpa = data['cgpa']
    if 'graduation_year' in data:
        student.graduation_year = data['graduation_year']
    if 'backlogs' in data:
        student.backlogs = data['backlogs']
    if 'resume_visibility' in data:
        student.resume_visibility = data['resume_visibility']
        
    db.session.commit()
    log_activity(student_id, 'student', f'Student {student.name} updated their profile')
    return jsonify({'message': 'Profile updated successfully'}), 200

@student_bp.route('/upload-resume', methods=['POST'])
@role_required('student')
def upload_resume():
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)
    
    if 'resume' not in request.files:
        return jsonify({'message': 'No resume file provided'}), 400
        
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'message': 'Only PDF, DOC, DOCX files are allowed'}), 400
    
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"resume_{student_id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    # Parse the resume
    parsed = {}
    try:
        from app.utils.resume_parser import parse_resume
        parsed = parse_resume(file_path)
    except Exception as e:
        print(f"Resume parsing error: {e}")
    
    # Update student profile with parsed data
    resume_url = f"/uploads/{filename}"
    student.resume_url = resume_url
    
    if parsed.get('skills') and not student.skills:
        student.skills = parsed.get('skills')
        
    db.session.commit()
    log_activity(student_id, 'student', f'Student {student.name} uploaded their resume')
    
    return jsonify({
        'message': 'Resume uploaded and parsed successfully',
        'resume_url': resume_url,
        'parsed_data': parsed
    }), 201

@student_bp.route('/drives', methods=['GET'])
@role_required('student')
def get_drives():
    # Search/filter parameters
    search = request.args.get('search', '').lower()
    branch = request.args.get('branch', '')
    skills_filter = request.args.get('skills', '')
    
    drives = PlacementDrive.query.filter_by(approved_status='approved').all()
    results = []
    for drive in drives:
        # Advanced search filtering
        if search and search not in drive.role.lower() and search not in drive.company.company_name.lower():
            continue
        if branch and drive.eligibility_branches and branch.lower() not in drive.eligibility_branches.lower():
            continue
        if skills_filter and drive.eligibility_skills and skills_filter.lower() not in drive.eligibility_skills.lower():
            continue
            
        results.append({
            'id': drive.id,
            'company_name': drive.company.company_name,
            'role': drive.role,
            'description': drive.description,
            'eligibility_cgpa': float(drive.eligibility_cgpa) if drive.eligibility_cgpa else None,
            'eligibility_branches': drive.eligibility_branches,
            'eligibility_skills': drive.eligibility_skills,
            'eligibility_year': drive.eligibility_year,
            'eligibility_backlogs': drive.eligibility_backlogs,
            'deadline': drive.deadline.isoformat() if drive.deadline else None,
            'interview_date': drive.interview_date.isoformat() if drive.interview_date else None
        })
    return jsonify(results), 200

@student_bp.route('/apply', methods=['POST'])
@role_required('student')
def apply_drive():
    student_id = get_jwt_identity()
    data = request.get_json()
    drive_id = data.get('drive_id')
    
    if not drive_id:
        return jsonify({'message': 'Drive ID is required'}), 400
        
    drive = PlacementDrive.query.get(drive_id)
    if not drive:
        return jsonify({'message': 'Drive not found'}), 404
        
    student = Student.query.get(student_id)
    
    # Eligibility check engine
    ineligibility_reasons = []
    
    if drive.eligibility_cgpa:
        if not student.cgpa or float(student.cgpa) < float(drive.eligibility_cgpa):
            ineligibility_reasons.append(f"required CGPA is {drive.eligibility_cgpa} and your CGPA is {student.cgpa or 'not set'}")
            
    if drive.eligibility_branches and getattr(student, 'department', None):
        allowed_branches = [b.strip().lower() for b in drive.eligibility_branches.split(',')]
        if student.department.strip().lower() not in allowed_branches:
            ineligibility_reasons.append(f"allowed branches are {drive.eligibility_branches} and your branch is {student.department}")
            
    if drive.eligibility_year:
        if not getattr(student, 'graduation_year', None) or student.graduation_year != drive.eligibility_year:
            ineligibility_reasons.append(f"required graduation year is {drive.eligibility_year}")
            
    if drive.eligibility_backlogs is not None:
        student_backlogs = getattr(student, 'backlogs', 0) or 0
        if student_backlogs > drive.eligibility_backlogs:
            ineligibility_reasons.append(f"maximum allowed backlogs is {drive.eligibility_backlogs} and you have {student_backlogs}")
            
    if drive.eligibility_skills and getattr(student, 'skills', None):
        required_skills = [s.strip().lower() for s in drive.eligibility_skills.split(',')]
        student_skills = [s.strip().lower() for s in student.skills.split(',')] if student.skills else []
        missing_skills = [s for s in required_skills if s not in student_skills]
        if missing_skills:
            ineligibility_reasons.append(f"you are missing required skills: {', '.join(missing_skills)}")
            
    if ineligibility_reasons:
        return jsonify({'message': f"You are not eligible because {' and '.join(ineligibility_reasons)}."}), 403
        
    existing_application = Application.query.filter_by(student_id=student_id, drive_id=drive_id).first()
    if existing_application:
        return jsonify({'message': 'Already applied for this drive'}), 400
        
    new_application = Application(student_id=student_id, drive_id=drive_id)
    db.session.add(new_application)
    
    # Notify company
    notification = Notification(
        user_id=drive.company_id,
        role='company',
        message=f'Student {student.name} applied for the {drive.role} role.'
    )
    db.session.add(notification)
    db.session.commit()
    
    log_activity(student_id, 'student', f'Student {student.name} applied to {drive.company.company_name} for {drive.role}')
    return jsonify({'message': 'Applied successfully'}), 201

@student_bp.route('/applications', methods=['GET'])
@role_required('student')
def get_applications():
    student_id = get_jwt_identity()
    applications = Application.query.filter_by(student_id=student_id).all()
    results = []
    for app in applications:
        # Application Timeline statuses
        timeline = [
            {'status': 'Applied', 'completed': True, 'date': app.applied_date.isoformat()},
            {'status': 'Shortlisted', 'completed': app.status in ['shortlisted', 'selected'], 'date': app.updated_at.isoformat() if app.status == 'shortlisted' else None},
            {'status': 'Interview Scheduled', 'completed': bool(app.drive.interview_date), 'date': app.drive.interview_date.isoformat() if app.drive.interview_date else None},
            {'status': 'Selected', 'completed': app.status == 'selected', 'date': app.updated_at.isoformat() if app.status == 'selected' else None},
            {'status': 'Rejected', 'completed': app.status == 'rejected', 'date': app.updated_at.isoformat() if app.status == 'rejected' else None},
        ]
        
        # Check for booked interview slot
        interview_slot = InterviewSlot.query.filter_by(drive_id=app.drive_id, student_id=student_id).first()
        
        results.append({
            'id': app.id,
            'drive_id': app.drive_id,
            'company_name': app.drive.company.company_name,
            'role': app.drive.role,
            'status': app.status,
            'applied_date': app.applied_date.isoformat(),
            'interview_date': app.drive.interview_date.isoformat() if app.drive.interview_date else None,
            'timeline': timeline,
            'booked_slot': {
                'start_time': interview_slot.start_time.isoformat(),
                'end_time': interview_slot.end_time.isoformat()
            } if interview_slot else None
        })
    return jsonify(results), 200

@student_bp.route('/check-eligibility/<int:drive_id>', methods=['GET'])
@role_required('student')
def check_eligibility(drive_id):
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)
    drive = PlacementDrive.query.get(drive_id)
    
    if not drive:
        return jsonify({'message': 'Drive not found'}), 404
    
    reasons = []
    if drive.eligibility_cgpa and (not student.cgpa or float(student.cgpa) < float(drive.eligibility_cgpa)):
        reasons.append(f"Required CGPA: {drive.eligibility_cgpa}, Your CGPA: {student.cgpa or 'N/A'}")
    if drive.eligibility_branches and student.department:
        allowed = [b.strip().lower() for b in drive.eligibility_branches.split(',')]
        if student.department.strip().lower() not in allowed:
            reasons.append(f"Allowed branches: {drive.eligibility_branches}, Your branch: {student.department}")
    if drive.eligibility_year and student.graduation_year != drive.eligibility_year:
        reasons.append(f"Required graduation year: {drive.eligibility_year}")
    if drive.eligibility_backlogs is not None:
        bl = getattr(student, 'backlogs', 0) or 0
        if bl > drive.eligibility_backlogs:
            reasons.append(f"Max backlogs: {drive.eligibility_backlogs}, Your backlogs: {bl}")
    if drive.eligibility_skills and student.skills:
        required = [s.strip().lower() for s in drive.eligibility_skills.split(',')]
        have = [s.strip().lower() for s in student.skills.split(',')]
        missing = [s for s in required if s not in have]
        if missing:
            reasons.append(f"Missing skills: {', '.join(missing)}")
    
    return jsonify({
        'eligible': len(reasons) == 0,
        'reasons': reasons
    }), 200

@student_bp.route('/recommendations', methods=['GET'])
@role_required('student')
def get_recommendations():
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)
    
    drives = PlacementDrive.query.filter_by(approved_status='approved').all()
    student_skills = [s.strip().lower() for s in student.skills.split(',')] if student.skills else []
    
    recommendations = []
    for drive in drives:
        score = 0
        reasons = []
        
        # Skill match score
        if drive.eligibility_skills:
            req_skills = [s.strip().lower() for s in drive.eligibility_skills.split(',')]
            matched = [s for s in req_skills if s in student_skills]
            if req_skills:
                skill_score = len(matched) / len(req_skills)
                score += skill_score * 50  # skill score out of 50
                reasons.append(f"Skill match: {int(skill_score*100)}%")
        else:
            score += 30  # no skill requirement, neutral score
        
        # CGPA match
        if drive.eligibility_cgpa and student.cgpa:
            if float(student.cgpa) >= float(drive.eligibility_cgpa):
                score += 25
        elif not drive.eligibility_cgpa:
            score += 25
        
        # Branch match
        if drive.eligibility_branches and student.department:
            allowed = [b.strip().lower() for b in drive.eligibility_branches.split(',')]
            if student.department.strip().lower() in allowed:
                score += 25
        elif not drive.eligibility_branches:
            score += 25
        
        # Only recommend if score is reasonable (above 30%)
        if score > 30:
            recommendations.append({
                'id': drive.id,
                'company_name': drive.company.company_name,
                'role': drive.role,
                'description': drive.description,
                'eligibility_cgpa': float(drive.eligibility_cgpa) if drive.eligibility_cgpa else None,
                'eligibility_skills': drive.eligibility_skills,
                'deadline': drive.deadline.isoformat() if drive.deadline else None,
                'match_score': round(score),
                'reasons': reasons
            })
    
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    return jsonify(recommendations[:10]), 200

@student_bp.route('/bookmarks', methods=['GET'])
@role_required('student')
def get_bookmarks():
    student_id = get_jwt_identity()
    bookmarks = Bookmark.query.filter_by(student_id=student_id).all()
    results = []
    for bm in bookmarks:
        drive = bm.drive
        results.append({
            'bookmark_id': bm.id,
            'drive_id': drive.id,
            'company_name': drive.company.company_name,
            'role': drive.role,
            'description': drive.description,
            'eligibility_cgpa': float(drive.eligibility_cgpa) if drive.eligibility_cgpa else None,
            'deadline': drive.deadline.isoformat() if drive.deadline else None,
            'bookmarked_at': bm.created_at.isoformat()
        })
    return jsonify(results), 200

@student_bp.route('/bookmarks', methods=['POST'])
@role_required('student')
def add_bookmark():
    student_id = get_jwt_identity()
    data = request.get_json()
    drive_id = data.get('drive_id')
    
    if not drive_id:
        return jsonify({'message': 'drive_id is required'}), 400
    
    drive = PlacementDrive.query.get(drive_id)
    if not drive:
        return jsonify({'message': 'Drive not found'}), 404
    
    existing = Bookmark.query.filter_by(student_id=student_id, drive_id=drive_id).first()
    if existing:
        return jsonify({'message': 'Drive already bookmarked'}), 400
    
    bookmark = Bookmark(student_id=student_id, drive_id=drive_id)
    db.session.add(bookmark)
    db.session.commit()
    return jsonify({'message': 'Drive bookmarked successfully', 'bookmark_id': bookmark.id}), 201

@student_bp.route('/bookmarks/<int:bookmark_id>', methods=['DELETE'])
@role_required('student')
def remove_bookmark(bookmark_id):
    student_id = get_jwt_identity()
    bookmark = Bookmark.query.filter_by(id=bookmark_id, student_id=student_id).first()
    if not bookmark:
        return jsonify({'message': 'Bookmark not found'}), 404
    db.session.delete(bookmark)
    db.session.commit()
    return jsonify({'message': 'Bookmark removed'}), 200

@student_bp.route('/interview-slots', methods=['GET'])
@role_required('student')
def get_available_slots():
    drive_id = request.args.get('drive_id')
    if not drive_id:
        return jsonify({'message': 'drive_id is required'}), 400
    
    slots = InterviewSlot.query.filter_by(drive_id=drive_id, status='available').all()
    return jsonify([{
        'id': s.id,
        'start_time': s.start_time.isoformat(),
        'end_time': s.end_time.isoformat(),
        'status': s.status
    } for s in slots]), 200

@student_bp.route('/book-slot/<int:slot_id>', methods=['POST'])
@role_required('student')
def book_slot(slot_id):
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)
    slot = InterviewSlot.query.get(slot_id)
    
    if not slot:
        return jsonify({'message': 'Slot not found'}), 404
    if slot.status == 'booked':
        return jsonify({'message': 'Slot already booked'}), 400
    
    # Check if student already has a slot for this drive
    existing = InterviewSlot.query.filter_by(drive_id=slot.drive_id, student_id=student_id).first()
    if existing:
        return jsonify({'message': 'You already have a slot booked for this drive'}), 400
    
    slot.student_id = student_id
    slot.status = 'booked'
    
    notification = Notification(
        user_id=student_id,
        role='student',
        message=f'Your interview slot is confirmed: {slot.start_time.strftime("%Y-%m-%d %H:%M")} - {slot.end_time.strftime("%H:%M")}'
    )
    db.session.add(notification)
    db.session.commit()
    log_activity(student_id, 'student', f'Student {student.name} booked an interview slot')
    
    return jsonify({'message': 'Slot booked successfully'}), 200
