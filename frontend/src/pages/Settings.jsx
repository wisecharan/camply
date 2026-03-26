import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Bell, Palette, AlertTriangle } from 'lucide-react';

const Settings = () => {
    const { user, role } = useAuth();
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General Profile', icon: User },
        { id: 'security', label: 'Security & Privacy', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
    ];

    return (
        <div className="font-sans w-full max-w-[1200px] mx-auto space-y-6">
            
            {/* Title handled by DashboardLayout, but keeping subtitle styling here */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mt-1">Manage your account preferences and application settings.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
                {/* Settings Sidebar */}
                <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-gray-100 bg-[#fbfbfc] p-6 space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-4">Account Settings</h3>
                    
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] font-medium transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60' 
                                        : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 border border-transparent'
                                }`}
                            >
                                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 p-8 md:p-12 bg-white">
                    <div className="max-w-2xl">
                        
                        {activeTab === 'general' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">General Profile</h3>

                                <div className="space-y-8">
                                    
                                    {/* Email Field */}
                                    <div>
                                        <label className="block text-[15px] font-medium text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                disabled
                                                value={user?.email || 'admin@campusplacement.com'}
                                                className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-500 font-medium cursor-not-allowed outline-none"
                                            />
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                <Shield className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="mt-2 text-[13px] text-gray-500">Your email address is managed by the administrator and cannot be changed.</p>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="pt-8 mt-12 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                            <h4 className="text-base font-bold text-gray-900">Danger Zone</h4>
                                        </div>
                                        
                                        <div className="p-6 border border-red-100 bg-red-50/30 rounded-[1.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-[15px] font-semibold text-gray-900">Delete Account</p>
                                                <p className="text-[13px] text-gray-500 mt-1 max-w-sm">Permanently remove your account and all associated data. This action cannot be undone.</p>
                                            </div>
                                            <button className="px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-full font-medium shadow-sm hover:bg-red-50 hover:border-red-300 transition-all flex-shrink-0">
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {activeTab !== 'general' && (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center animate-in fade-in duration-500">
                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                    {activeTab === 'security' && <Shield className="w-8 h-8 text-gray-300" />}
                                    {activeTab === 'notifications' && <Bell className="w-8 h-8 text-gray-300" />}
                                    {activeTab === 'appearance' && <Palette className="w-8 h-8 text-gray-300" />}
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 capitalize mb-1">{activeTab} Settings</h4>
                                <p className="text-gray-500 text-sm">This section is currently under construction.</p>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;