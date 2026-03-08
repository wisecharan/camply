import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    const { role, user } = useAuth();
    const navigate = useNavigate();
    
    // Core State: Controls the width of both the Sidebar AND the main content margin
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Real-time clock state
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    
    // Determine the display name for the avatar fallback
    const displayName = user?.name || user?.company_name || user?.username || 'User';
    
    // Check if the user has an actual profile picture
    const avatarUrl = user?.profile_picture 
        ? `http://localhost:5000${user.profile_picture}` 
        : `https://ui-avatars.com/api/?name=${displayName}&background=0D8ABC&color=fff&rounded=true`;

    // Dynamic Action Button based on Role
    const renderActionButton = () => {
        if (role === 'company') {
            return (
                <button 
                    onClick={() => navigate('/company/create-drive')}
                    className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-black transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Post Drive
                </button>
            );
        }
        if (role === 'admin') {
            return (
                <button 
                    className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-black transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Export Report
                </button>
            );
        }
        return null; 
    };

    // Format the date and time
    const timeString = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateString = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <div className="min-h-screen bg-[#f5f5f5] text-gray-900 font-sans flex">
            
            {/* Sidebar gets the shared isCollapsed state */}
            <Sidebar 
                role={role} 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
            />

            {/* Main Content Wrapper - Shrinks margin from ml-64 to ml-20 when collapsed */}
            <div className={`flex-1 flex flex-col min-h-screen relative transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                
                {/* Top Header */}
                <header className="h-24 px-8 lg:px-10 flex items-center justify-end sticky top-0 z-40 bg-[#f5f5f5]/80 backdrop-blur-md border-b border-transparent">
                    
                    {/* Right side actions: Clock + Button + Profile */}
                    <div className="flex items-center gap-5">
                        
                        {/* Real-Time Clock */}
                        <div className="hidden md:flex flex-col items-end mr-1">
                            <span className="text-[15px] font-semibold text-gray-900 leading-tight tracking-tight">
                                {timeString}
                            </span>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                                {dateString}
                            </span>
                        </div>

                        {/* Role-Specific Action Button */}
                        {renderActionButton()}

                        {/* Profile Avatar & Settings Trigger */}
                        <button 
                            onClick={() => navigate(`/${role}/settings`)}
                            className="flex items-center gap-3 p-1 pr-3 bg-white rounded-full border border-gray-100 shadow-sm hover:shadow transition-all group"
                        >
                            <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                <img 
                                    src={avatarUrl} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="hidden lg:block text-sm font-semibold text-gray-700 group-hover:text-gray-900 truncate max-w-[100px]">
                                {displayName.split(' ')[0]}
                            </span>
                        </button>

                    </div>
                </header>

                {/* Main Page Content */}
                <main className="flex-1 px-6 lg:px-10 pb-12 pt-4">
                    <div className="max-w-[1600px] w-full mx-auto animate-in fade-in duration-300">
                        {children}
                    </div>
                </main>

            </div>
            
        </div>
    );
};

export default DashboardLayout;