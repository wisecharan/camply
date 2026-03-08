import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Activity, ShieldCheck, User, Building, ShieldAlert, History } from 'lucide-react';

// Refined icons using lucide-react to match the modern aesthetic
const RoleIcon = ({ role }) => {
    switch (role?.toLowerCase()) {
        case 'student': return <User className="w-[18px] h-[18px] text-blue-600" />;
        case 'company': return <Building className="w-[18px] h-[18px] text-purple-600" />;
        case 'admin': return <ShieldCheck className="w-[18px] h-[18px] text-amber-600" />;
        default: return <Activity className="w-[18px] h-[18px] text-gray-500" />;
    }
};

const ROLE_COLORS = { 
    student: 'bg-blue-50 text-blue-700 border-blue-100', 
    company: 'bg-purple-50 text-purple-700 border-purple-100', 
    admin: 'bg-amber-50 text-amber-700 border-amber-100' 
};

const ActivityFeed = () => {
    const [logs, setLogs] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [tab, setTab] = useState('activity');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/admin/activity-feed'),
            api.get('/admin/audit-logs')
        ]).then(([a, b]) => {
            setLogs(a.data);
            setAuditLogs(b.data);
        }).finally(() => setLoading(false));
    }, []);

    const timeAgo = (isoStr) => {
        const d = new Date(isoStr);
        const diff = (Date.now() - d) / 1000;
        if (diff < 60) return `${Math.floor(diff)}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="space-y-6 max-w-4xl font-sans">
            
            {/* Header section (Title will be handled by DashboardLayout, but we keep subtitle here) */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-semibold text-gray-900 flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-400" />
                        System Events
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Track and monitor all activities across the platform.</p>
                </div>
            </div>

            {/* Pill-shaped Tabs matching the Landing Page filter chips */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-gray-100 shadow-sm w-max">
                <button 
                    onClick={() => setTab('activity')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                        tab === 'activity' 
                            ? 'bg-gray-900 text-white shadow-md' 
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <Activity className={`w-4 h-4 ${tab === 'activity' ? 'text-white' : 'text-gray-400'}`} />
                    Activity Feed
                </button>
                <button 
                    onClick={() => setTab('audit')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                        tab === 'audit' 
                            ? 'bg-gray-900 text-white shadow-md' 
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <ShieldAlert className={`w-4 h-4 ${tab === 'audit' ? 'text-white' : 'text-gray-400'}`} />
                    Audit Logs
                </button>
            </div>

            {/* Main Content Card matching the Dashboard aesthetic */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
                    </div>
                ) : tab === 'activity' ? (
                    logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Activity className="w-12 h-12 text-gray-200 mb-4" />
                            <p className="text-gray-500 font-medium">No activity yet</p>
                            <p className="text-sm text-gray-400 mt-1">When users perform actions, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map(log => (
                                <div key={log.id} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-[#f8f9fa] border border-transparent hover:border-gray-100 transition-all duration-200">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <RoleIcon role={log.role} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-medium text-gray-900 leading-snug">{log.action}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${ROLE_COLORS[log.role?.toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-200'} capitalize`}>
                                                {log.role}
                                            </span>
                                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                                                {timeAgo(log.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    auditLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <ShieldAlert className="w-12 h-12 text-gray-200 mb-4" />
                            <p className="text-gray-500 font-medium">No audit events</p>
                            <p className="text-sm text-gray-400 mt-1">System level security and data changes will log here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {auditLogs.map(log => (
                                <div key={log.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-[#f8f9fa] border border-gray-100 hover:border-gray-200 transition-all duration-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm flex-shrink-0">
                                            <ShieldCheck className="w-[18px] h-[18px] text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-medium text-gray-900">{log.action}</p>
                                            {log.details && <p className="text-[13px] text-gray-500 mt-1">{log.details}</p>}
                                        </div>
                                    </div>
                                    
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pl-14 sm:pl-0 gap-2 sm:gap-1.5 flex-shrink-0">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${ROLE_COLORS[log.role?.toLowerCase()] || 'bg-white text-gray-600 border-gray-200'} capitalize`}>
                                            {log.role || 'System'}
                                        </span>
                                        <span className="text-xs font-medium text-gray-400">
                                            {timeAgo(log.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;