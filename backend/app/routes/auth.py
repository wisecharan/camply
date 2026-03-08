from flask import Blueprint, request, jsonify
from app.models import db, Student, Company, Admin
from flask_bcrypt import Bcrypt
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

def _hash_password(password: str) -> str:
    """Use generate_password_hash for compatibility with legacy hashes,
    but new registrations get bcrypt via flask_bcrypt."""
    return generate_password_hash(password)

def _verify_password(stored_hash: str, password: str) -> bool:
    return check_password_hash(stored_hash, password)

# --- Registration Routes ---

def register_student_handler():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Missing required fields'}), 400

    if Student.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = _hash_password(data['password'])
    new_student = Student(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        phone=data.get('phone'),
        department=data.get('department'),
        graduation_year=data.get('graduation_year'),
        backlogs=data.get('backlogs', 0)
    )
    db.session.add(new_student)
    db.session.commit()

    return jsonify({'message': 'Student registered successfully, pending admin approval'}), 201

def register_company_handler():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('company_name'):
        return jsonify({'message': 'Missing required fields'}), 400

    if Company.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Company already exists'}), 400

    hashed_password = _hash_password(data['password'])
    new_company = Company(
        company_name=data['company_name'],
        email=data['email'],
        password=hashed_password,
        industry=data.get('industry'),
        description=data.get('description')
    )
    db.session.add(new_company)
    db.session.commit()

    return jsonify({'message': 'Company registered successfully, pending admin approval'}), 201

def login_handler():
    data = request.get_json()
    email_or_username = data.get('email')
    password = data.get('password')

    if not email_or_username or not password:
        return jsonify({'message': 'Missing credentials'}), 400

    # Check Admin First
    admin = Admin.query.filter_by(username=email_or_username).first()
    if admin and _verify_password(admin.password, password):
        access_token = create_access_token(identity=str(admin.id), additional_claims={'role': 'admin'})
        refresh_token = create_refresh_token(identity=str(admin.id), additional_claims={'role': 'admin'})
        return jsonify({'token': access_token, 'refresh_token': refresh_token, 'role': 'admin', 'user': {'username': admin.username}}), 200

    # Check Student
    student = Student.query.filter_by(email=email_or_username).first()
    if student and _verify_password(student.password, password):
        if student.approved_status != 'approved':
            return jsonify({'message': 'Account not approved yet by Admin'}), 403
        access_token = create_access_token(identity=str(student.id), additional_claims={'role': 'student'})
        refresh_token = create_refresh_token(identity=str(student.id), additional_claims={'role': 'student'})
        return jsonify({'token': access_token, 'refresh_token': refresh_token, 'role': 'student', 'user': {'name': student.name, 'email': student.email}}), 200

    # Check Company
    company = Company.query.filter_by(email=email_or_username).first()
    if company and _verify_password(company.password, password):
        if company.approved_status != 'approved':
            return jsonify({'message': 'Account not approved yet by Admin'}), 403
        access_token = create_access_token(identity=str(company.id), additional_claims={'role': 'company'})
        refresh_token = create_refresh_token(identity=str(company.id), additional_claims={'role': 'company'})
        return jsonify({'token': access_token, 'refresh_token': refresh_token, 'role': 'company', 'user': {'company_name': company.company_name, 'email': company.email}}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

# Register each function as both a route AND export the view function for rate-limiting
@auth_bp.route('/register/student', methods=['POST'])
def register_student_endpoint():
    return register_student_handler()

@auth_bp.route('/register/company', methods=['POST'])
def register_company_endpoint():
    return register_company_handler()

@auth_bp.route('/login', methods=['POST'])
def login_endpoint():
    return login_handler()
