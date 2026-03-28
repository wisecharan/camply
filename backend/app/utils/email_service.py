import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from concurrent.futures import ThreadPoolExecutor

# Use a thread pool to send emails in the background without blocking the API
executor = ThreadPoolExecutor(max_workers=5)

def send_async_email(to_email, subject, html_content):
    """Core function to actually dispatch the email asynchronously"""
    def send():
        try:
            sender = os.environ.get('MAIL_USERNAME')
            password = os.environ.get('MAIL_PASSWORD')
            
            if not sender or not password:
                print("Email credentials missing in .env!")
                return

            msg = MIMEMultipart("alternative")
            msg['Subject'] = subject
            msg['From'] = f"Camply Placement Cell <{sender}>"
            msg['To'] = to_email
            
            msg.attach(MIMEText(html_content, 'html'))
            
            # Connect to Gmail SMTP Server
            server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
            server.login(sender, password)
            server.sendmail(sender, to_email, msg.as_string())
            server.quit()
            print(f"[SUCCESS] Email sent to {to_email}")
        except Exception as e:
            print(f"[ERROR] Failed to send email to {to_email}: {str(e)}")
            
    executor.submit(send)

# -----------------------------------------
# Notification Triggers
# -----------------------------------------

def notify_registration(user_email, user_name):
    subject = "Welcome to Camply - Registration Received"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #111827;">Welcome to Camply, {user_name}!</h2>
        <p style="color: #4b5563; line-height: 1.6;">Your account has been successfully created. However, for security purposes, it is currently <strong>pending approval</strong> from the system administrator.</p>
        <p style="color: #4b5563; line-height: 1.6;">We will notify you immediately once your account is verified and ready to use.</p>
        <br/>
        <p style="color: #9ca3af; font-size: 12px;">- The Camply Team</p>
    </div>
    """
    send_async_email(user_email, subject, html)

def notify_approval(user_email, user_name):
    subject = "Your Camply Account is Approved!"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">Account Approved 🎉</h2>
        <p style="color: #4b5563; line-height: 1.6;">Hello {user_name}, good news! Your account has been verified by the administrator.</p>
        <p style="color: #4b5563; line-height: 1.6;">You can now log in to the portal, update your profile, and explore placement opportunities.</p>
        <br/>
        <p style="color: #9ca3af; font-size: 12px;">- The Camply Team</p>
    </div>
    """
    send_async_email(user_email, subject, html)

def notify_new_drive(student_emails, company_name, role_name):
    """Accepts a list of emails for mass sending to eligible students"""
    subject = f"New Placement Drive: {company_name}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">New Opportunity Available</h2>
        <p style="color: #4b5563; line-height: 1.6;"><strong>{company_name}</strong> has just posted a new placement drive for the role of <strong>{role_name}</strong>.</p>
        <p style="color: #4b5563; line-height: 1.6;">Log in to the Camply portal to check the eligibility criteria and apply before the deadline!</p>
        <br/>
        <p style="color: #9ca3af; font-size: 12px;">- The Camply Team</p>
    </div>
    """
    # Bypassing the normal function to loop through and BCC securely
    for email in student_emails:
        send_async_email(email, subject, html)

def notify_application_result(user_email, user_name, company_name, role, status):
    colors = {
        'shortlisted': '#f59e0b', # Amber
        'selected': '#10b981',    # Green
        'rejected': '#ef4444'     # Red
    }
    color = colors.get(status, '#111827')
    
    subject = f"Application Update: {company_name}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: {color}; text-transform: capitalize;">Application {status}</h2>
        <p style="color: #4b5563; line-height: 1.6;">Hello {user_name},</p>
        <p style="color: #4b5563; line-height: 1.6;">Your application status for the <strong>{role}</strong> role at <strong>{company_name}</strong> has been updated to: <strong style="color: {color}; text-transform: uppercase;">{status}</strong>.</p>
        <p style="color: #4b5563; line-height: 1.6;">Please log in to your dashboard for further details or next steps.</p>
        <br/>
        <p style="color: #9ca3af; font-size: 12px;">- The Camply Team</p>
    </div>
    """
    send_async_email(user_email, subject, html)