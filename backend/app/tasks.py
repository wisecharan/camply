from app.utils.email_service import notify_new_drive
from app.models import Student

def process_new_drive_notifications(company_name, role_name, eligibility_cgpa=None):
    # Get all eligible student emails
    query = Student.query.filter_by(approved_status='approved')
    if eligibility_cgpa:
        query = query.filter(Student.cgpa >= eligibility_cgpa)
        
    eligible_students = query.all()
    student_emails = [student.email for student in eligible_students]

    # Trigger Mass Email
    if student_emails:
        notify_new_drive(student_emails, company_name, role_name)