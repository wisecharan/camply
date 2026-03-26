# Campus Placement Recruitment System - Installation Guide

This guide will walk you through setting up the project locally on a Windows machine.

## Prerequisites
Before you begin, ensure you have the following installed on your system:
1. **Python** (version 3.10 or higher) - [Download Here](https://www.python.org/downloads/)
2. **Node.js** (version 18 or higher) - [Download Here](https://nodejs.org/)
3. **MySQL Server** (version 8.0) - [Download Here](https://dev.mysql.com/downloads/installer/)

---

## Step 1: Database Setup
1. Open your MySQL Command Line Client or MySQL Workbench.
2. Log in with your root password.
3. Run the following command to create the necessary database:
   ```sql
   CREATE DATABASE campus_placement;
   ```

---

## Step 2: Backend Setup (Python)
1. Open a terminal (Command Prompt or PowerShell) and navigate to the project folder.
2. Go into the backend directory:
   ```bash
   cd backend
   ```
3. Create a virtual environment to safely install dependencies:
   ```bash
   python -m venv venv
   ```
4. Activate the virtual environment:
   ```bash
   venv\Scripts\activate
   ```
5. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
6. **Configuration**: Create a file named `.env` in the `backend` folder and add your database credentials. For example:
   ```env
   SECRET_KEY=super-secret-key
   DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost/campus_placement
   JWT_SECRET_KEY=jwt-secret-key
   ```
   *(Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL root password).*

7. Initialize the database tables and create the default Admin account:
   ```bash
   python seed_admin.py
   ```
   *You should see a success message that the Admin was created.*

8. Start the backend server:
   ```bash
   python run.py
   ```
   *Keep this terminal open.*

---

## Step 3: Frontend Setup (React/Node)
1. Open a **new** terminal window.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install the required Node packages:
   ```bash
   npm install
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. The terminal will give you a local URL (usually `http://localhost:5173/`). Open this URL in your web browser.

---

## Step 4: Login Credentials
The system is now running! You can log in using the default Admin account you created earlier:

- **Email or Username:** `admin@campusplacement.com`
- **Password:** `admin123`

You can then create new student and company accounts from the website.

*(Note: If you need to share this guide as a PDF, most web browsers and text editors like VS Code allow you to simply "Print" -> "Save as PDF" while viewing this document).*
