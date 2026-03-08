from flask_mail import Message
from run import mail

def send_email(to_email: str, subject: str, body: str):
    """Send a plain text email notification."""
    try:
        msg = Message(subject=subject, recipients=[to_email], body=body)
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Email send failed: {e}")
        return False

def notify_shortlisted(student_email: str, student_name: str, company_name: str, role: str):
    subject = f"Congratulations! You've been shortlisted by {company_name}"
    body = (
        f"Dear {student_name},\n\n"
        f"Great news! You have been shortlisted by {company_name} for the role of {role}.\n"
        f"Please log in to the placement portal for further details and to book an interview slot.\n\n"
        f"Best Regards,\nCampus Placement Team"
    )
    send_email(to_email=student_email, subject=subject, body=body)

def notify_selected(student_email: str, student_name: str, company_name: str, role: str):
    subject = f"Offer Letter: You've been selected by {company_name}!"
    body = (
        f"Dear {student_name},\n\n"
        f"Congratulations! You have been selected by {company_name} for the role of {role}.\n"
        f"Please contact your placement coordinator for next steps.\n\n"
        f"Best Regards,\nCampus Placement Team"
    )
    send_email(to_email=student_email, subject=subject, body=body)

def notify_rejected(student_email: str, student_name: str, company_name: str, role: str):
    subject = f"Application Update - {company_name}"
    body = (
        f"Dear {student_name},\n\n"
        f"We regret to inform you that your application to {company_name} for the role of {role} "
        f"has not moved forward at this time.\n"
        f"Keep applying — there are more drives coming up!\n\n"
        f"Best Regards,\nCampus Placement Team"
    )
    send_email(to_email=student_email, subject=subject, body=body)

def notify_interview_scheduled(student_email: str, student_name: str, company_name: str, slot_time: str):
    subject = f"Interview Scheduled with {company_name}"
    body = (
        f"Dear {student_name},\n\n"
        f"Your interview with {company_name} is scheduled for: {slot_time}.\n"
        f"Please log in to the placement portal for more details.\n\n"
        f"Best Regards,\nCampus Placement Team"
    )
    send_email(to_email=student_email, subject=subject, body=body)
