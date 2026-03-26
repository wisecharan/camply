import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import RegisterOptions from './pages/RegisterOptions';
import DashboardLayout from './components/layout/DashboardLayout';

import StudentDashboard from './pages/student/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { role, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f9fafb]">
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterOptions />} />

            {/* Protected Routes */}
            <Route path="/student/*" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/company/*" element={<ProtectedRoute allowedRoles={['company']}><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
