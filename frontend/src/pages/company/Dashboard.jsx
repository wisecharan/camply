import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import Drives from './Drives';
import CreateDrive from './CreateDrive';
import Applicants from './Applicants';
import Settings from '../Settings';
import Profile from './Profile';

const CompanyDashboard = () => {
    return (
        <Routes>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="profile" element={<Profile />} />
            <Route path="drives" element={<Drives />} />
            <Route path="create-drive" element={<CreateDrive />} />
            <Route path="applicants" element={<Applicants />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
    );
};

export default CompanyDashboard;