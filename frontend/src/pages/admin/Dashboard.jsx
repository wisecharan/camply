import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import Students from './Students';
import Companies from './Companies';
import Drives from './Drives';
import Reports from './Reports';
import Analytics from './Analytics';
import ActivityFeed from './ActivityFeed';
import Settings from '../Settings';

const AdminDashboard = () => {
    return (
        <Routes>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="students" element={<Students />} />
            <Route path="companies" element={<Companies />} />
            <Route path="drives" element={<Drives />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="activity" element={<ActivityFeed />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
    );
};

export default AdminDashboard;
