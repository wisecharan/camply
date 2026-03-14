# CAMPLY: Campus Placement Recruitment System

A production-ready web application to automate campus placement processes.

## Architecture
- **Frontend**: React.js, Vite, TailwindCSS
- **Backend**: Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended
- **Database**: MySQL 8.0
- **Deployment**: Docker, Docker Compose

## Features
- **Student Portal**: Register, create profile, browse drives, apply, and track status.
- **Company Portal**: Register, post drives, set eligibility, review applicants, shortcut/reject candidates.
- **Admin Portal**: Approve/reject users, manage the system, view placement reports and export to CSV.
- **Security**: JWT Authentication, Role-based access control, Rate limiting, Password hashing (bcrypt).
- **Notifications**: In-app notifications for system events (e.g. status updates).

## Setup & Deployment (Docker)

1. Make sure you have Docker and Docker Compose installed.
2. In the root directory (`e:\campus_placement`), run:
   ```bash
   docker-compose up --build -d
   ```
3. The database will automatically initialize using `database/schema.sql`.
4. Access the application:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost:5000/api`

## Important Endpoints (API Documentation)

### Auth
- `POST /api/register/student`
- `POST /api/register/company`
- `POST /api/login`

### Student
- `GET/PUT /api/student/profile`
- `GET /api/student/drives`
- `POST /api/student/apply`
- `GET /api/student/applications`

### Company
- `POST /api/company/create-drive`
- `GET /api/company/drives`
- `GET /api/company/applicants?drive_id=X`
- `PUT /api/company/update-status`

### Admin
- `GET /api/admin/students`
- `GET /api/admin/companies`
- `POST /api/admin/approve-user`
- `GET /api/admin/reports`

### Notifications
- `GET /api/notifications`
- `PUT /api/notifications/<id>/read`

## Manual Development Setup

**Backend**:
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*(Ensure a MySQL database named `campus_placement` is running on localhost)*

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```
