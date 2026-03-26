import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, Users, UserCircle, Briefcase, 
    FileText, Settings, LogOut, ChevronLeft, ChevronRight, AlertTriangle 
} from 'lucide-react';

const Sidebar = ({ role, isCollapsed, setIsCollapsed }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    let navItems = [];

    // Profile is excluded from navItems because it's now explicitly at the bottom
    if (role === 'student') {
        navItems = [
            { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
            { name: 'Drives', to: '/student/drives', icon: Briefcase },
            { name: 'Recommended', to: '/student/recommendations', icon: Users },
            { name: 'Bookmarks', to: '/student/bookmarks', icon: FileText },
            { name: 'Applications', to: '/student/applications', icon: FileText },
        ];
    } else if (role === 'company') {
        navItems = [
            { name: 'Dashboard', to: '/company/dashboard', icon: LayoutDashboard },
            { name: 'My Postings', to: '/company/drives', icon: Briefcase },
            { name: 'Applicants', to: '/company/applicants', icon: Users },
        ];
    } else if (role === 'admin') {
        navItems = [
            { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Students', to: '/admin/students', icon: Users },
            { name: 'Companies', to: '/admin/companies', icon: Briefcase },
            { name: 'Manage Drives', to: '/admin/drives', icon: Briefcase },
            { name: 'Analytics', to: '/admin/analytics', icon: FileText },
            { name: 'Activity Feed', to: '/admin/activity', icon: Users },
            { name: 'Reports', to: '/admin/reports', icon: FileText },
        ];
    }

    const handleLogout = () => {
        setShowLogoutConfirm(false);
        logout();
        navigate('/');
    };

    return (
        <>
            <aside 
                className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#f5f5f5] min-h-screen fixed left-0 top-0 flex flex-col py-6 font-sans transition-all duration-300 z-50 border-r border-gray-200/50 shadow-sm`}
            >
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-4 top-8 bg-white border border-gray-200 rounded-full p-1.5 shadow-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 z-[100] cursor-pointer flex items-center justify-center transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <div className="px-4 flex-1 flex flex-col">
                    <div className={`mb-10 flex items-center h-10 ${isCollapsed ? 'justify-center' : 'pl-2'}`}>
                        {isCollapsed ? (
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                C
                            </div>
                        ) : (
                            <span className="text-2xl font-bold tracking-tight text-gray-900 whitespace-nowrap">
                                Campus Placement<span className="text-indigo-600">.</span>
                            </span>
                        )}
                    </div>

                    <nav className="flex-1 w-full space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.to}
                                    title={isCollapsed ? item.name : ""}
                                    className={({ isActive }) =>
                                        `group flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-[15px] font-medium rounded-2xl transition-all duration-200 ${
                                            isActive
                                                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60'
                                                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50 border border-transparent'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon className={`${isCollapsed ? '' : 'mr-3'} h-[18px] w-[18px] transition-colors flex-shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                            {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Bottom Section: Profile, Settings, and Sign Out */}
                    <div className="mt-auto space-y-1 border-t border-gray-200/60 pt-4">
                        <NavLink 
                            to={`/${role}/profile`} 
                            title={isCollapsed ? "Profile" : ""}
                            className={({ isActive }) => 
                                `group flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-[15px] font-medium rounded-2xl transition-all duration-200 ${
                                    isActive ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50 border border-transparent'
                                }`
                            }
                        >
                            <UserCircle className={`${isCollapsed ? '' : 'mr-3'} h-[18px] w-[18px] text-gray-400 group-hover:text-gray-600 flex-shrink-0`} />
                            {!isCollapsed && <span className="whitespace-nowrap">Profile</span>}
                        </NavLink>

                        <NavLink 
                            to={`/${role}/settings`} 
                            title={isCollapsed ? "Settings" : ""}
                            className={({ isActive }) => 
                                `group flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-[15px] font-medium rounded-2xl transition-all duration-200 ${
                                    isActive ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50 border border-transparent'
                                }`
                            }
                        >
                            <Settings className={`${isCollapsed ? '' : 'mr-3'} h-[18px] w-[18px] text-gray-400 group-hover:text-gray-600 flex-shrink-0`} />
                            {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
                        </NavLink>

                        <button 
                            onClick={() => setShowLogoutConfirm(true)}
                            title={isCollapsed ? "Sign Out" : ""}
                            className={`w-full group flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-[15px] font-medium rounded-2xl transition-all duration-200 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent`}
                        >
                            <LogOut className={`${isCollapsed ? '' : 'mr-3'} h-[18px] w-[18px] text-gray-400 group-hover:text-red-600 flex-shrink-0`} />
                            {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Logout Confirmation Modal Overlay */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to leave?</h2>
                        <p className="text-sm text-gray-500 mb-8">
                            Are you sure you want to sign out of your account? You will need to log back in to access your dashboard.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)} 
                                className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleLogout} 
                                className="flex-1 py-3.5 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 shadow-md transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;