from flask import Blueprint, request, jsonify
from app.models import db, Student, Company, PlacementDrive, Application, Notification, ActivityLog, AuditLog
from app.middleware.auth import role_required
from flask_jwt_extended import get_jwt_identity
from sqlalchemy import func
from app.utils.email_service import notify_approval

admin_bp = Blueprint('admin', __name__)

def log_audit(user_id, role, action, details=None):
    try:
        log = AuditLog(user_id=user_id, role=role, action=action, details=details)
        db.session.add(log)
        db.session.commit()
    except:
        pass

def log_activity(user_id, role, action):
    try:
        log = ActivityLog(user_id=user_id, role=role, action=action)
        db.session.add(log)
        db.session.commit()
    except:
        pass

@admin_bp.route('/students', methods=['GET'])
@role_required('admin')
def get_students():
    # Advanced search filters
    name = request.args.get('name', '').lower()
    skills = request.args.get('skills', '').lower()
    branch = request.args.get('branch', '').lower()
    cgpa_min = request.args.get('cgpa_min', type=float)
    cgpa_max = request.args.get('cgpa_max', type=float)
    grad_year = request.args.get('graduation_year', type=int)
    status_filter = request.args.get('status', '')

    students = Student.query.all()
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
        if status_filter and student.approved_status != status_filter:
            continue

        results.append({
            'id': student.id,
            'name': student.name,
            'email': student.email,
            'department': student.department,
            'cgpa': float(student.cgpa) if student.cgpa else None,
            'skills': student.skills,
            'graduation_year': student.graduation_year,
            'approved_status': student.approved_status,
            'created_at': student.created_at.isoformat()
        })
    return jsonify(results), 200

@admin_bp.route('/companies', methods=['GET'])
@role_required('admin')
def get_companies():
    companies = Company.query.all()
    results = []
    for company in companies:
        results.append({
            'id': company.id,
            'company_name': company.company_name,
            'email': company.email,
            'industry': company.industry,
            'approved_status': company.approved_status,
            'created_at': company.created_at.isoformat()
        })
    return jsonify(results), 200

@admin_bp.route('/approve-user', methods=['POST'])
@role_required('admin')
def approve_user():
    admin_id = get_jwt_identity()
    data = request.get_json()
    user_type = data.get('user_type')
    user_id = data.get('user_id')
    status = data.get('status')
    
    if not all([user_type, user_id, status]) or status not in ['approved', 'rejected']:
        return jsonify({'message': 'Invalid data'}), 400
        
    if user_type == 'student':
        user = Student.query.get(user_id)
        if not user:
            return jsonify({'message': 'Student not found'}), 404
        user.approved_status = status
        name = user.name
        
    elif user_type == 'company':
        user = Company.query.get(user_id)
        if not user:
            return jsonify({'message': 'Company not found'}), 404
        user.approved_status = status
        name = user.company_name
    else:
        return jsonify({'message': 'Invalid user_type. Must be student or company'}), 400
        
    # Notify the user
    notification = Notification(
        user_id=user.id,
        role=user_type,
        message=f"Your account registration has been {status} by the admin."
    )
    db.session.add(notification)
    db.session.commit()
    
    log_activity(admin_id, 'admin', f'Admin {status} {user_type} account for {name}')
    log_audit(admin_id, 'admin', f'Admin {status} {user_type}', f'{user_type.title()}: {name}')

    if status == 'approved':
        # Trigger Email
        notify_approval(user.email, name)
    
    return jsonify({'message': f'{user_type.capitalize()} account status updated to {status}'}), 200

@admin_bp.route('/all-drives', methods=['GET'])
@role_required('admin')
def get_all_drives():
    drives = db.session.query(PlacementDrive, Company).join(Company, PlacementDrive.company_id == Company.id).all()
    results = []
    for drive, company in drives:
        results.append({
            'id': drive.id,
            'company_name': company.company_name,
            'role': drive.role,
            'approved_status': drive.approved_status,
            'deadline': drive.deadline.isoformat() if drive.deadline else None,
            'created_at': drive.created_at.isoformat()
        })
    return jsonify(results), 200

@admin_bp.route('/drives/<int:drive_id>/status', methods=['PUT'])
@role_required('admin')
def update_drive_status(drive_id):
    admin_id = get_jwt_identity()
    data = request.get_json()
    status = data.get('status')
    
    if status not in ['approved', 'rejected']:
        return jsonify({'message': 'Invalid status'}), 400
        
    drive = PlacementDrive.query.get(drive_id)
    if not drive:
        return jsonify({'message': 'Drive not found'}), 404
        
    drive.approved_status = status
    db.session.commit()
    
    # Notify Company
    notification = Notification(
        user_id=drive.company_id,
        role='company',
        message=f"Your placement drive for {drive.role} has been {status}."
    )
    db.session.add(notification)
    db.session.commit()
    
    log_activity(admin_id, 'admin', f'Admin {status} placement drive for role {drive.role}')
    
    return jsonify({'message': f'Drive status updated to {status}'}), 200

@admin_bp.route('/reports', methods=['GET'])
@role_required('admin')
def get_reports():
    total_students = Student.query.count()
    total_companies = Company.query.count()
    total_drives = PlacementDrive.query.count()
    total_placements = Application.query.filter_by(status='selected').count()
    approved_students = Student.query.filter_by(approved_status='approved').count()
    
    placement_pct = round(total_placements / approved_students * 100, 1) if approved_students > 0 else 0
    
    return jsonify({
        'total_students': total_students,
        'approved_students': approved_students,
        'total_companies': total_companies,
        'approved_companies': Company.query.filter_by(approved_status='approved').count(),
        'total_drives': total_drives,
        'total_placements': total_placements,
        'placement_percentage': placement_pct
    }), 200

@admin_bp.route('/analytics', methods=['GET'])
@role_required('admin')
def get_analytics():
    """Placement analytics for charts"""
    # Students placed per department
    dept_query = db.session.query(
        Student.department,
        func.count(Application.id).label('placed_count')
    ).join(Application, Application.student_id == Student.id)\
     .filter(Application.status == 'selected')\
     .group_by(Student.department).all()
    
    dept_data = [{'department': row[0] or 'Unknown', 'placed': row[1]} for row in dept_query]
    
    # Applications per drive
    drive_query = db.session.query(
        PlacementDrive.role,
        Company.company_name,
        func.count(Application.id).label('application_count')
    ).join(Company, Company.id == PlacementDrive.company_id)\
     .join(Application, Application.drive_id == PlacementDrive.id)\
     .group_by(PlacementDrive.id, PlacementDrive.role, Company.company_name)\
     .limit(10).all()
    
    drive_data = [{'label': f"{row[1]} - {row[0]}", 'applications': row[2]} for row in drive_query]
    
    # Applications over time (by month)
    monthly_query = db.session.query(
        func.year(Application.applied_date).label('year'),
        func.month(Application.applied_date).label('month'),
        func.count(Application.id).label('count')
    ).group_by(func.year(Application.applied_date), func.month(Application.applied_date))\
     .order_by(func.year(Application.applied_date), func.month(Application.applied_date))\
     .limit(12).all()
    
    monthly_data = [{'period': f"{row[0]}-{str(row[1]).zfill(2)}", 'applications': row[2]} for row in monthly_query]
    
    # Status distribution
    status_query = db.session.query(
        Application.status,
        func.count(Application.id).label('count')
    ).group_by(Application.status).all()
    
    status_data = [{'status': row[0], 'count': row[1]} for row in status_query]
    
    # Overview stats
    total_placements = Application.query.filter_by(status='selected').count()
    total_students = Student.query.filter_by(approved_status='approved').count()
    
    return jsonify({
        'overview': {
            'total_students': total_students,
            'total_companies': Company.query.count(),
            'total_drives': PlacementDrive.query.count(),
            'total_placements': total_placements,
            'placement_percentage': round(total_placements / total_students * 100, 1) if total_students > 0 else 0
        },
        'by_department': dept_data,
        'by_drive': drive_data,
        'monthly_applications': monthly_data,
        'status_distribution': status_data
    }), 200

@admin_bp.route('/activity-feed', methods=['GET'])
@role_required('admin')
def get_activity_feed():
    """Get real-time system activity feed"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc())\
        .offset((page-1)*per_page).limit(per_page).all()
    
    return jsonify([{
        'id': log.id,
        'user_id': log.user_id,
        'role': log.role,
        'action': log.action,
        'timestamp': log.timestamp.isoformat()
    } for log in logs]), 200

@admin_bp.route('/audit-logs', methods=['GET'])
@role_required('admin')
def get_audit_logs():
    """Get system audit logs"""
    page = request.args.get('page', 1, type=int)
    role_filter = request.args.get('role', '')
    per_page = 20
    
    query = AuditLog.query
    if role_filter:
        query = query.filter_by(role=role_filter)
    
    logs = query.order_by(AuditLog.timestamp.desc())\
        .offset((page-1)*per_page).limit(per_page).all()
    
    return jsonify([{
        'id': log.id,
        'user_id': log.user_id,
        'role': log.role,
        'action': log.action,
        'details': log.details,
        'timestamp': log.timestamp.isoformat()
    } for log in logs]), 200

@admin_bp.route('/notifications', methods=['GET'])
@role_required('admin')
def get_admin_notifications():
    admin_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=admin_id, role='admin').order_by(Notification.created_at.desc()).limit(20).all()
    results = [{'message': n.message, 'created_at': n.created_at.isoformat()} for n in notifications]
    return jsonify(results), 200