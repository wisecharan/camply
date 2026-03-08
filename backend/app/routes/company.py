from flask import Blueprint, request, jsonify
from app.models import db, PlacementDrive, Application, Student, Notification, Company, ActivityLog, AuditLog, InterviewSlot, ResumeDownloadLog
from app.middleware.auth import role_required
from flask_jwt_extended import get_jwt_identity

company_bp = Blueprint('company', __name__)

def log_activity(user_id, role, action):
    try:
        log = ActivityLog(user_id=user_id, role=role, action=action)
        db.session.add(log)
        db.session.commit()
    except:
        pass

def log_audit(user_id, role, action, details=None):
    try:
        log = AuditLog(user_id=user_id, role=role, action=action, details=details)
        db.session.add(log)
        db.session.commit()
    except:
        pass

def calculate_skill_match(student_skills_str, required_skills_str):
    if not required_skills_str:
        return 100.0
    if not student_skills_str:
        return 0.0
    required = [s.strip().lower() for s in required_skills_str.split(',')]
    have = [s.strip().lower() for s in student_skills_str.split(',')]
    if not required:
        return 100.0
    matched = [s for s in required if s in have]
    return round(len(matched) / len(required) * 100, 1)

@company_bp.route('/profile', methods=['GET'])
@role_required('company')
def get_profile():
    company_id = get_jwt_identity()
    company = Company.query.get(company_id)
    if not company:
        return jsonify({'message': 'Company not found'}), 404
        
    return jsonify({
        'company_name': company.company_name,
        'email': company.email,
        'industry': company.industry,
        'description': company.description,
        'profile_picture': company.profile_picture,
        'approved_status': company.approved_status
    }), 200

@company_bp.route('/profile', methods=['PUT'])
@role_required('company')
def update_profile():
    company_id = get_jwt_identity()
    company = Company.query.get(company_id)
    data = request.get_json()
    
    company.company_name = data.get('company_name', company.company_name)
    company.industry = data.get('industry', company.industry)
    company.description = data.get('description', company.description)
    company.profile_picture = data.get('profile_picture', company.profile_picture)
        
    db.session.commit()
    log_audit(company_id, 'company', f'Company {company.company_name} updated profile')
    return jsonify({'message': 'Profile updated successfully'}), 200

@company_bp.route('/create-drive', methods=['POST'])
@role_required('company')
def create_drive():
    company_id = get_jwt_identity()
    company = Company.query.get(company_id)
    data = request.get_json()
    
    required_fields = ['role', 'description', 'deadline', 'interview_date']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
        
    new_drive = PlacementDrive(
        company_id=company_id,
        role=data['role'],
        description=data['description'],
        eligibility_cgpa=data.get('eligibility_cgpa'),
        eligibility_branches=data.get('eligibility_branches'),
        eligibility_skills=data.get('eligibility_skills'),
        eligibility_year=data.get('eligibility_year'),
        eligibility_backlogs=data.get('eligibility_backlogs'),
        deadline=data['deadline'],
        interview_date=data['interview_date']
    )
    db.session.add(new_drive)
    
    # Notify eligible students
    if data.get('eligibility_cgpa'):
        eligible_students = Student.query.filter(Student.cgpa >= data['eligibility_cgpa']).all()
    else:
        eligible_students = Student.query.all()
        
    for student in eligible_students:
        notification = Notification(
            user_id=student.id,
            role='student',
            message=f"New drive posted by {company.company_name} for {data['role']} role. Check if you are eligible!"
        )
        db.session.add(notification)
        
    db.session.commit()
    
    log_activity(company_id, 'company', f'Company {company.company_name} posted a drive for {data["role"]}')
    log_audit(company_id, 'company', f'Company {company.company_name} created placement drive', f'Role: {data["role"]}')
    
    return jsonify({'message': 'Drive created successfully', 'drive_id': new_drive.id}), 201

@company_bp.route('/drives', methods=['GET'])
@role_required('company')
def get_company_drives():
    company_id = get_jwt_identity()
    drives = PlacementDrive.query.filter_by(company_id=company_id).all()
    
    results = []
    for drive in drives:
        applicant_count = Application.query.filter_by(drive_id=drive.id).count()
        results.append({
            'id': drive.id,
            'role': drive.role,
            'description': drive.description,
            'eligibility_cgpa': float(drive.eligibility_cgpa) if drive.eligibility_cgpa else None,
            'eligibility_branches': drive.eligibility_branches,
            'eligibility_skills': drive.eligibility_skills,
            'eligibility_year': drive.eligibility_year,
            'eligibility_backlogs': drive.eligibility_backlogs,
            'deadline': drive.deadline.isoformat() if drive.deadline else None,
            'interview_date': drive.interview_date.isoformat() if drive.interview_date else None,
            'applicant_count': applicant_count
        })
    return jsonify(results), 200

@company_bp.route('/applicants', methods=['GET'])
@role_required('company')
def get_applicants():
    company_id = get_jwt_identity()
    drive_id = request.args.get('drive_id')
    
    if not drive_id:
        return jsonify({'message': 'drive_id parameter is required'}), 400
        
    drive = PlacementDrive.query.filter_by(id=drive_id, company_id=company_id).first()
    if not drive:
        return jsonify({'message': 'Drive not found or access denied'}), 404
    
    # Advanced search parameters
    name_filter = request.args.get('name', '').lower()
    skills_filter = request.args.get('skills', '').lower()
    branch_filter = request.args.get('branch', '').lower()
    cgpa_min = request.args.get('cgpa_min', type=float)
    cgpa_max = request.args.get('cgpa_max', type=float)
    grad_year = request.args.get('graduation_year', type=int)
        
    applications = Application.query.filter_by(drive_id=drive_id).all()
    results = []
    for app in applications:
        student = app.student
        
        # Apply filters
        if name_filter and name_filter not in student.name.lower():
            continue
        if skills_filter and student.skills and skills_filter not in student.skills.lower():
            continue
        if branch_filter and student.department and branch_filter not in student.department.lower():
            continue
        if cgpa_min is not None and student.cgpa and float(student.cgpa) < cgpa_min:
            continue
        if cgpa_max is not None and student.cgpa and float(student.cgpa) > cgpa_max:
            continue
        if grad_year and student.graduation_year and student.graduation_year != grad_year:
            continue
            
        skill_match = calculate_skill_match(student.skills, drive.eligibility_skills)
        
        # Resume visibility check
        resume_url = None
        if student.resume_url:
            if student.resume_visibility == 'all':
                resume_url = student.resume_url
            elif student.resume_visibility == 'applied':
                resume_url = student.resume_url  # They applied, so show it
            # 'private' -> do not show
        
        results.append({
            'application_id': app.id,
            'student_id': student.id,
            'student_name': student.name,
            'student_email': student.email,
            'student_cgpa': float(student.cgpa) if student.cgpa else None,
            'student_skills': student.skills,
            'student_department': student.department,
            'student_graduation_year': student.graduation_year,
            'student_resume': resume_url,
            'skill_match_score': skill_match,
            'status': app.status,
            'applied_date': app.applied_date.isoformat()
        })
    
    # Sort by skill_match_score descending (ranking)
    results.sort(key=lambda x: x['skill_match_score'], reverse=True)
    for i, r in enumerate(results):
        r['rank'] = i + 1
    
    return jsonify(results), 200

@company_bp.route('/resume-download/<int:student_id>', methods=['POST'])
@role_required('company')
def log_resume_download(student_id):
    company_id = get_jwt_identity()
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    # Log the download
    log = ResumeDownloadLog(company_id=company_id, student_id=student_id)
    db.session.add(log)
    
    # Notify student
    company = Company.query.get(company_id)
    notif = Notification(
        user_id=student_id,
        role='student',
        message=f'Your resume was viewed by {company.company_name} recruiter.'
    )
    db.session.add(notif)
    db.session.commit()
    
    return jsonify({'message': 'Download logged'}), 200

@company_bp.route('/update-status', methods=['PUT'])
@role_required('company')
def update_status():
    company_id = get_jwt_identity()
    data = request.get_json()
    application_id = data.get('application_id')
    new_status = data.get('status')
    
    if not application_id or not new_status:
        return jsonify({'message': 'Missing required fields'}), 400
        
    if new_status not in ['shortlisted', 'rejected', 'selected']:
        return jsonify({'message': 'Invalid status'}), 400
        
    application = Application.query.get(application_id)
    if not application or application.drive.company_id != int(company_id):
        return jsonify({'message': 'Application not found or access denied'}), 404
        
    application.status = new_status
    company = Company.query.get(company_id)
    
    # Notify student
    notification = Notification(
        user_id=application.student_id,
        role='student',
        message=f"Your application status for {application.drive.company.company_name} - {application.drive.role} has been updated to {new_status}."
    )
    db.session.add(notification)
    db.session.commit()
    
    status_label = new_status.title()
    log_activity(company_id, 'company', f'{company.company_name} {status_label} {application.student.name} for {application.drive.role}')
    log_audit(company_id, 'company', f'Application status updated to {new_status}', f'Student: {application.student.name}, Drive: {application.drive.role}')
    
    return jsonify({'message': 'Application status updated successfully'}), 200

@company_bp.route('/interview-slots', methods=['GET'])
@role_required('company')
def get_interview_slots():
    company_id = get_jwt_identity()
    drive_id = request.args.get('drive_id')
    
    query = InterviewSlot.query.filter_by(company_id=company_id)
    if drive_id:
        query = query.filter_by(drive_id=drive_id)
    
    slots = query.all()
    return jsonify([{
        'id': s.id,
        'drive_id': s.drive_id,
        'start_time': s.start_time.isoformat(),
        'end_time': s.end_time.isoformat(),
        'status': s.status,
        'student_name': s.student.name if s.student else None,
        'student_email': s.student.email if s.student else None
    } for s in slots]), 200

@company_bp.route('/interview-slots', methods=['POST'])
@role_required('company')
def create_interview_slot():
    company_id = get_jwt_identity()
    data = request.get_json()
    drive_id = data.get('drive_id')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    
    if not all([drive_id, start_time, end_time]):
        return jsonify({'message': 'Missing required fields: drive_id, start_time, end_time'}), 400
    
    drive = PlacementDrive.query.filter_by(id=drive_id, company_id=company_id).first()
    if not drive:
        return jsonify({'message': 'Drive not found or access denied'}), 404
    
    from datetime import datetime
    slot = InterviewSlot(
        drive_id=drive_id,
        company_id=company_id,
        start_time=datetime.fromisoformat(start_time),
        end_time=datetime.fromisoformat(end_time),
        status='available'
    )
    db.session.add(slot)
    db.session.commit()
    
    return jsonify({'message': 'Interview slot created successfully', 'slot_id': slot.id}), 201

@company_bp.route('/search-students', methods=['GET'])
@role_required('company')
def search_students():
    """Advanced student search for companies"""
    name = request.args.get('name', '').lower()
    skills = request.args.get('skills', '').lower()
    branch = request.args.get('branch', '').lower()
    cgpa_min = request.args.get('cgpa_min', type=float)
    cgpa_max = request.args.get('cgpa_max', type=float)
    grad_year = request.args.get('graduation_year', type=int)
    
    query = Student.query.filter_by(approved_status='approved')
    students = query.all()
    
    results = []
    for student in students:
        if name and name not in student.name.lower():
            continue
        if skills and student.skills and skills not in student.skills.lower():
            continue
        if branch and student.department and branch not in student.department.lower():
            continue
        if cgpa_min is not None and student.cgpa and float(student.cgpa) < cgpa_min:
            continue
        if cgpa_max is not None and student.cgpa and float(student.cgpa) > cgpa_max:
            continue
        if grad_year and student.graduation_year and student.graduation_year != grad_year:
            continue
        
        # Respect resume visibility
        resume_url = None
        if student.resume_url and student.resume_visibility == 'all':
            resume_url = student.resume_url
        
        results.append({
            'id': student.id,
            'name': student.name,
            'email': student.email,
            'department': student.department,
            'cgpa': float(student.cgpa) if student.cgpa else None,
            'skills': student.skills,
            'graduation_year': student.graduation_year,
            'backlogs': student.backlogs,
            'resume_url': resume_url
        })
    
    return jsonify(results), 200
