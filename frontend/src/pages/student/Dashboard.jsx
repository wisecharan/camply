import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import Profile from './Profile';
import Drives from './Drives';
import Applications from './Applications';
import Recommendations from './Recommendations';
import Bookmarks from './Bookmarks';
import Settings from '../Settings';

const StudentDashboard = () => {
    return (
        <Routes>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="profile" element={<Profile />} />
            <Route path="drives" element={<Drives />} />
            <Route path="applications" element={<Applications />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="bookmarks" element={<Bookmarks />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
    );
};

export default StudentDashboard;
